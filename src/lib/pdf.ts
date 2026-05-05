import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ResearchData } from "./gemini";

// Funkce pro odstranění diakritiky (pro StandardFonts v pdf-lib, které ji neumí)
function removeDiacritics(text: string): string {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function generatePdf(data: ResearchData, hostName: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Používáme standardní fonty, které fungují všude bez externích souborů
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  let y = height - 50;

  // Header - odstraňujeme diakritiku pro standardní fonty
  page.drawText(removeDiacritics(`Podcast Briefing: ${hostName}`), {
    x: 50,
    y: y,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });
  y -= 30;

  page.drawText(removeDiacritics(`Vygenerováno pro: Vojta Žižka`), {
    x: 50,
    y: y,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 40;

  const sections = [
    { title: 'Bio', content: [data.bio] },
    { title: 'Aktuální témata', content: data.currentTopics },
    { title: 'Zajímavosti', content: data.interestingFacts },
    { title: 'Navržené otázky', content: data.suggestedQuestions },
  ];

  if (data.potentialControversies && data.potentialControversies.length > 0) {
    sections.push({ title: 'Potenciální kontroverze', content: data.potentialControversies });
  }

  for (const section of sections) {
    if (y < 100) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - 50;
    }

    page.drawText(removeDiacritics(section.title), {
      x: 50,
      y: y,
      size: 18,
      font: fontBold,
      color: rgb(0.2, 0.3, 0.5),
    });
    y -= 25;

    for (const item of section.content) {
      const text = section.content.length > 1 ? `• ${item}` : item;
      const cleanText = removeDiacritics(text);
      const maxWidth = width - 100;
      
      const words = cleanText.split(' ');
      let line = '';

      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = fontRegular.widthOfTextAtSize(testLine, 11);
        
        if (textWidth > maxWidth) {
          page.drawText(line.trim(), { x: 50, y: y, size: 11, font: fontRegular });
          y -= 15;
          line = word + ' ';
          
          if (y < 50) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = height - 50;
          }
        } else {
          line = testLine;
        }
      }
      page.drawText(line.trim(), { x: 50, y: y, size: 11, font: fontRegular });
      y -= 20;
    }
    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
