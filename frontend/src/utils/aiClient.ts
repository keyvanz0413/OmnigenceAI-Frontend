import OpenAI from 'openai';

export const generateTemplateFromImage = async (
  apiKey: string,
  base64Image: string,
  baseUrl?: string,
  model?: string
): Promise<string> => {
  const openai = new OpenAI({
    apiKey,
    baseURL: baseUrl || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true, // Since this is a client-side only MVP
  });

  const response = await openai.chat.completions.create({
    model: model || "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a World-Class Frontend Developer specializing in High-Fidelity UI Reconstruction.
        Your task is to convert a document image into a pixel-perfect HTML + Tailwind CSS replica.

        CRITICAL DESIGN RULES:
        1. VISUAL FIDELITY: Your primary goal is to make the HTML look EXACTLY like the image. 
           - Reconstruct layouts, spacing, typography, borders, and colors using Tailwind CSS.
           - If there are 10 empty rows in the image, you MUST generate 10 <tr> rows in HTML.
           - Use the actual text seen in the image (or blank spaces if the image is blank).

        3. DYNAMIC PLACEHOLDERS:
           - Scan the image for data fields that clearly change (e.g., Customer Name, Address, Invoice Date, Invoice Number, Totals).
           - Replace these fields with semantic Handlebars placeholders using double braces: {{customer_name}}, {{shipping_address}}, {{invoice_date}}, {{invoice_no}}, {{subtotal}}, {{total_amount}}.
           - For table rows, use placeholders like {{this.description}}, {{this.qty}}, {{this.price}}.

        4. TRACEABILITY (STILL CRITICAL):
           - Every row in a table (<tr>) must still have a data attribute: data-row-index="0", etc.
           - This ensures our selection logic still works for marking the dynamic template row.

        4. CLEAN OUTPUT:
           - Return ONLY raw HTML/Tailwind code. 
           - NO markdown code blocks (\`\`\`html).
           - NO explanations. NO preamble.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please generate a Tailwind CSS + Handlebars HTML template based on this document image."
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ],
    max_tokens: 4000,
  });

  return response.choices[0].message.content || '';
};
