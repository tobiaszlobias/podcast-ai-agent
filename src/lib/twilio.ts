import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to: string, body: string, mediaUrl?: string) {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: to,
      body: body,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    });
    return message;
  } catch (error) {
    console.error("Chyba při odesílání WhatsApp zprávy:", error);
    throw error;
  }
}
