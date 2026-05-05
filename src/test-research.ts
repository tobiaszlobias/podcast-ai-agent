import "dotenv/config";
import { generateResearch } from "./lib/gemini";
import { generatePdf } from "./lib/pdf";
import { uploadPdf } from "./lib/supabase";
import { prisma } from "./lib/prisma";

async function test() {
  const hostName = "Petr Mára";
  console.log(`🚀 Startuji test pro hosta: ${hostName}`);

  try {
    // 1. AI Rešerše
    console.log("🔍 1. Volám Gemini pro rešerši...");
    const data = await generateResearch(hostName);
    console.log("✅ Data z Gemini získána:", JSON.stringify(data, null, 2));

    // 2. Generování PDF
    console.log("📄 2. Generuji PDF...");
    const pdfBuffer = await generatePdf(data, hostName);
    console.log(`✅ PDF vygenerováno (${pdfBuffer.length} bytes)`);

    // 3. Nahrání do Supabase Storage
    console.log("☁️ 3. Nahrávám do Supabase Storage...");
    const fileName = `test-${Date.now()}.pdf`;
    const publicUrl = await uploadPdf(pdfBuffer, fileName);
    console.log("✅ PDF nahráno! Veřejná URL:", publicUrl);

    // 4. Uložení do DB
    console.log("💾 4. Ukládám záznam do DB...");
    const record = await prisma.researchRequest.create({
      data: {
        hostName,
        status: "COMPLETED",
        summary: data as unknown as Record<string, unknown>,
      }
    });
    console.log("✅ Záznam uložen do DB s ID:", record.id);

    console.log("\n🎉 TEST PROBĚHL ÚSPĚŠNĚ!");
    console.log("Můžeš si zkusit otevřít tu URL v prohlížeči.");

  } catch (error) {
    console.error("❌ TEST SELHAL:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
