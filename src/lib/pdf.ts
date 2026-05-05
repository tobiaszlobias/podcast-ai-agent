import { PDFDocument, rgb } from 'pdf-lib';
import { ResearchData } from "./gemini";
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

export async function generatePdf(data: ResearchData, hostName: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Načtení fontů s podporou češtiny z projektu
  const fontRegularPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Regular.ttf');
  const fontBoldPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Bold.ttf');
  
  const fontRegularBytes = fs.readFileSync(fontRegularPath);
  const fontBoldBytes = fs.readFileSync(fontBoldPath);

  const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  let y = height - 50;

  // Header
  page.drawText(`Podcast Briefing: ${hostName}`, {
    x: 50,
    y: y,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });
  y -= 30;

  page.drawText(`Vygenerováno pro: Vojta Žižka`, {
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

    page.drawText(section.title, {
      x: 50,
      y: y,
      size: 18,
      font: fontBold,
      color: rgb(0.2, 0.3, 0.5),
    });
    y -= 25;

    for (const item of section.content) {
      const text = section.content.length > 1 ? `• ${item}` : item;
      const maxWidth = width - 100;
      
      // Jednoduché zalamování řádků
      const words = text.split(' ');
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
            // Opětovné nastavení fontu na nové stránce není potřeba, ale musíme hlídat y
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
