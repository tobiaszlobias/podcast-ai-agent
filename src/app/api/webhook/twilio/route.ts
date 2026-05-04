import { prisma } from "@/lib/prisma";
import { generateResearch } from "@/lib/gemini";
import { generatePdf } from "@/lib/pdf";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { uploadPdf } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

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
      `Díky! Jdu prozkoumat internety a připravit podklady pro hosta: ${hostName}. Vydrž chvilku...`
    );

    // 2. Asynchronní zpracování
    const processResearch = async () => {
      try {
        console.log(`Starting research for: ${hostName}`);
        
        const researchRequest = await prisma.researchRequest.create({
          data: { hostName, status: "PROCESSING" },
        });

        const data = await generateResearch(hostName);
        const pdfBuffer = await generatePdf(data, hostName);

        // Nahrání do Supabase Storage
        const fileName = `${researchRequest.id}-${hostName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        const publicUrl = await uploadPdf(pdfBuffer, fileName);

        await prisma.researchRequest.update({
          where: { id: researchRequest.id },
          data: {
            status: "COMPLETED",
            summary: data as any,
          },
        });
        
        await sendWhatsAppMessage(
          from,
          `Tady je tvoje rešerše pro hosta: ${hostName}`,
          publicUrl
        );
        
        console.log(`Research completed for: ${hostName}`);
      } catch (error) {
        console.error("Chyba při asynchronním zpracování:", error);
        await sendWhatsAppMessage(
          from,
          `Omlouvám se, ale při přípravě rešerše pro ${hostName} došlo k chybě. Zkus to prosím později.`
        );
      }
    };

    processResearch();

    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
