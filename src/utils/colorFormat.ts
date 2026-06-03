export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  pantone?: string;
}

export const hexToRgb = (hex: string): [number, number, number] => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return [r, g, b];
};

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const rgbToCmyk = (r: number, g: number, b: number): [number, number, number, number] => {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  const k = Math.min(c, m, y);

  if (k === 1) {
    return [0, 0, 0, 100];
  }

  c = ((c - k) / (1 - k)) * 100;
  m = ((m - k) / (1 - k)) * 100;
  y = ((y - k) / (1 - k)) * 100;

  return [Math.round(c), Math.round(m), Math.round(y), Math.round(k * 100)];
};

export const getColorFormats = (hex: string): ColorFormats => {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [c, m, y, k] = rgbToCmyk(r, g, b);

  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    cmyk: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`,
  };
};

export const exportToJSON = (colors: { hex: string; label?: string }[]): string => {
  const data = colors.map((color) => ({
    ...getColorFormats(color.hex),
    label: color.label || '',
  }));
  return JSON.stringify(data, null, 2);
};

export const exportToCSS = (colors: { hex: string; label?: string }[]): string => {
  return colors
    .map((color, index) => {
      const name = color.label?.toLowerCase().replace(/\s+/g, '-') || `color-${index + 1}`;
      return `  --${name}: ${color.hex};`;
    })
    .join('\n');
};

export const exportToSCSS = (colors: { hex: string; label?: string }[]): string => {
  return colors
    .map((color, index) => {
      const name = color.label?.toLowerCase().replace(/\s+/g, '-') || `color-${index + 1}`;
      return `$${name}: ${color.hex};`;
    })
    .join('\n');
};

export const exportToSVG = (colors: { hex: string; label?: string }[]): string => {
  const swatches = colors
    .map((color, index) => {
      const x = (index % 5) * 120;
      const y = Math.floor(index / 5) * 140;
      return `
    <rect x="${x}" y="${y}" width="100" height="100" fill="${color.hex}" rx="4"/>
    <text x="${x + 50}" y="${y + 120}" text-anchor="middle" font-size="12" fill="#333">${color.hex}</text>`;
    })
    .join('');

  const width = Math.min(colors.length, 5) * 120;
  const height = Math.ceil(colors.length / 5) * 140;

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f5f5f5"/>${swatches}
</svg>`;
};
