import * as FileSystem from 'expo-file-system';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const generateDecoration = async (
  eventType: string,
  decorStyle: string,
  vision: string,
  photoUri?: string,
) => {
  const prompt = `
    You are an expert Ghanaian interior and event decorator.
    A client wants decoration advice for:
    - Event Type: ${eventType}
    - Decoration Style: ${decorStyle}
    - Their Vision: ${vision || 'No specific vision provided'}
    ${photoUri ? '- A photo of their space has been attached. Please analyse it and tailor your advice to the actual space shown.' : ''}
    
    Please provide:
    CONCEPT NAME: (one creative name)
    DESCRIPTION: (2-3 sentences about the theme)
    KEY ITEMS: (list 6 decoration items with dashes)
    COLOUR PALETTE: (3 colour suggestions)
    BUDGET: (estimated range in GHS)
    SOURCING TIPS: (2 Ghana-specific tips)
  `;

  // Build parts array — always include text
  const parts: any[] = [{ text: prompt }];

  // If photo provided convert to base64 and add it
  if (photoUri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      parts.unshift({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64,
        },
      });
    } catch (e) {
      console.log('Could not read photo, proceeding without it');
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.candidates[0].content.parts[0].text;
};