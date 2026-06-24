import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type OcrResult = {
  amount_bob: number | null;
  transaction_id: string | null;
  destination_account: string | null;
  payment_date: string | null;         // YYYY-MM-DD
  confidence: 'high' | 'low';
  raw_text: string;
};

export async function extractReceiptData(
  imageBase64: string,
  mediaType: string,
): Promise<OcrResult> {
  const safeMediaType = (
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mediaType)
      ? mediaType
      : 'image/jpeg'
  ) as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: safeMediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `This is a Bolivian bank payment receipt (comprobante de pago/transferencia)
from the $imple QR system or any Bolivian bank (Banco Bisa, BNB, Mercantil Santa Cruz, BancoSol, etc.).

Extract these 4 fields. Return ONLY valid JSON — no markdown, no extra text:

{
  "amount_bob": <number: amount in Bolivianos e.g. 99.60 — null if not found>,
  "transaction_id": <string: reference/codigo de transaccion/NRO — null if not found>,
  "destination_account": <string: destination account number or recipient name — null if not found>,
  "payment_date": <string: date in YYYY-MM-DD format — null if not found>,
  "confidence": <"high" if ALL 4 fields found clearly, otherwise "low">,
  "raw_text": <string: all visible text from the receipt concatenated>
}`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return { amount_bob: null, transaction_id: null, destination_account: null, payment_date: null, confidence: 'low', raw_text: '' };
  }

  try {
    // Strip any accidental markdown fences
    const cleaned = content.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as OcrResult;
  } catch {
    return {
      amount_bob: null,
      transaction_id: null,
      destination_account: null,
      payment_date: null,
      confidence: 'low',
      raw_text: content.text,
    };
  }
}
