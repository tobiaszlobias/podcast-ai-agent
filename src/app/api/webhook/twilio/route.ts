import { prisma } from "@/lib/prisma";
import { generateResearch } from "@/lib/gemini";
import { generatePdf } from "@/lib/pdf";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { uploadPdf } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;

    if (!from || !body) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const hostName = body.trim();

    // 1. Okamžitá potvrzovací zpráva
    await sendWhatsAppMessage(
      from,
      `Jasně, už na tom makám! 🕵️‍♂️ Omrknu, co o ${hostName} píšou na netu, a za chvilku ti pošlu PDFko.`
    );

    // 2. Zpracování rešerše - u Vercelu musíme počkat na dokončení, 
    // jinak se funkce ukončí dříve, než se PDF nahraje a odešle.
    try {
      console.log(`[PROCESS] Starting research for: ${hostName}`);
      
      const researchRequest = await prisma.researchRequest.create({
        data: { hostName, status: "PROCESSING" },
      });

      console.log(`[PROCESS] Generating AI research...`);
      const data = await generateResearch(hostName);
      
      console.log(`[PROCESS] Generating PDF briefing...`);
      const pdfBuffer = await generatePdf(data, hostName);

      // Nahrání do Supabase Storage
      const fileName = `${researchRequest.id}-${hostName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      console.log(`[PROCESS] Uploading PDF to Supabase: ${fileName}`);
      const publicUrl = await uploadPdf(pdfBuffer, fileName);

      console.log(`[PROCESS] Updating database record...`);
      await prisma.researchRequest.update({
        where: { id: researchRequest.id },
        data: {
          status: "COMPLETED",
          summary: data as unknown as Prisma.InputJsonValue,
        },
      });
      
      await sendWhatsAppMessage(
        from,
        `Hotovo! Tady máš rešerši na hosta: ${hostName}. Ať se rozhovor povede! 🎙️`,
        publicUrl
      );
      
      console.log(`[SUCCESS] Research completed for: ${hostName}`);
    } catch (error) {
      console.error("[ERROR] Detailed processing error:", error);
      await sendWhatsAppMessage(
        from,
        `Hele, něco se pokazilo při zkoumání ${hostName}. 😕 Zkus to prosím za chvilku znova.`
      );
    }

    // Twilio očekává TwiML odpověď
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
