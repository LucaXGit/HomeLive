export type VoiceCommand =
  | {
      type: 'add_shopping_item';
      productName: string;
      quantity: number;
    }
  | {
      type: 'unknown';
      rawText: string;
    };

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?¿¡]/g, '');
}

export function parseVoiceCommand(
  text: string
): VoiceCommand {
  const normalized = normalizeText(text);

  const patterns = [
    /^comprar (.+)$/,
    /^agregar (.+)$/,
    /^añadir (.+)$/,
    /^agrega (.+)$/,
    /^añade (.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]?.trim()) {
      return {
        type: 'add_shopping_item',
        productName: match[1].trim(),
        quantity: 1,
      };
    }
  }

  return {
    type: 'unknown',
    rawText: text,
  };
}
