export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  frequency: number;
  saturation: number;
  brightness: number;
  lab?: [number, number, number];
}

// RGB to Lab color space conversion for better distance calculation
const rgbToXyz = (r: number, g: number, b: number): [number, number, number] => {
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
  const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
  const z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

  return [x * 100, y * 100, z * 100];
};

const xyzToLab = (x: number, y: number, z: number): [number, number, number] => {
  const xRef = 95.047;
  const yRef = 100.000;
  const zRef = 108.883;

  const xNorm = x / xRef;
  const yNorm = y / yRef;
  const zNorm = z / zRef;

  const fx = xNorm > 0.008856 ? Math.pow(xNorm, 1 / 3) : (7.787 * xNorm) + (16 / 116);
  const fy = yNorm > 0.008856 ? Math.pow(yNorm, 1 / 3) : (7.787 * yNorm) + (16 / 116);
  const fz = zNorm > 0.008856 ? Math.pow(zNorm, 1 / 3) : (7.787 * zNorm) + (16 / 116);

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [l, a, b];
};

const rgbToLab = (r: number, g: number, b: number): [number, number, number] => {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
};

// Euclidean distance in CIE Lab color space for approximate color similarity
const colorDistance = (lab1: [number, number, number], lab2: [number, number, number]): number => {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  return Math.sqrt(Math.pow(l1 - l2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2));
};

// Calculate saturation and brightness
const getColorMetrics = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const brightness = (r + g + b) / (3 * 255);
  return { saturation, brightness };
};

// Median cut algorithm for color quantization
const medianCut = (colors: Array<{ r: number; g: number; b: number; count: number }>, depth: number): Array<{ r: number; g: number; b: number; count: number }> => {
  if (depth === 0 || colors.length <= 1) {
    // Calculate average color in this bucket
    const totalCount = colors.reduce((sum, c) => sum + c.count, 0);
    const avgR = Math.round(colors.reduce((sum, c) => sum + c.r * c.count, 0) / totalCount);
    const avgG = Math.round(colors.reduce((sum, c) => sum + c.g * c.count, 0) / totalCount);
    const avgB = Math.round(colors.reduce((sum, c) => sum + c.b * c.count, 0) / totalCount);
    return [{ r: avgR, g: avgG, b: avgB, count: totalCount }];
  }

  // Find the channel with the largest range
  const rRange = Math.max(...colors.map(c => c.r)) - Math.min(...colors.map(c => c.r));
  const gRange = Math.max(...colors.map(c => c.g)) - Math.min(...colors.map(c => c.g));
  const bRange = Math.max(...colors.map(c => c.b)) - Math.min(...colors.map(c => c.b));

  const channel = rRange >= gRange && rRange >= bRange ? 'r' : gRange >= bRange ? 'g' : 'b';

  // Sort by the channel with largest range
  const sorted = [...colors].sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(sorted.length / 2);

  // Recursively process both halves
  return [
    ...medianCut(sorted.slice(0, mid), depth - 1),
    ...medianCut(sorted.slice(mid), depth - 1)
  ];
};

// Merge similar colors (ΔE < 15)
const mergeSimilarColors = (colors: ExtractedColor[]): ExtractedColor[] => {
  const merged: ExtractedColor[] = [];
  const threshold = 15;

  for (const color of colors) {
    let found = false;
    for (const existing of merged) {
      if (color.lab && existing.lab) {
        const distance = colorDistance(color.lab, existing.lab);
        if (distance < threshold) {
          // Merge by weighted average
          const totalFreq = existing.frequency + color.frequency;
          existing.rgb[0] = Math.round((existing.rgb[0] * existing.frequency + color.rgb[0] * color.frequency) / totalFreq);
          existing.rgb[1] = Math.round((existing.rgb[1] * existing.frequency + color.rgb[1] * color.frequency) / totalFreq);
          existing.rgb[2] = Math.round((existing.rgb[2] * existing.frequency + color.rgb[2] * color.frequency) / totalFreq);
          existing.frequency = totalFreq;
          existing.lab = rgbToLab(existing.rgb[0], existing.rgb[1], existing.rgb[2]);
          const metrics = getColorMetrics(existing.rgb[0], existing.rgb[1], existing.rgb[2]);
          existing.saturation = metrics.saturation;
          existing.brightness = metrics.brightness;
          existing.hex = rgbToHex(existing.rgb[0], existing.rgb[1], existing.rgb[2]);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      merged.push({ ...color });
    }
  }

  return merged;
};

// Categorize colors according to brand color rules
const categorizeColors = (colors: ExtractedColor[]) => {
  const primary: ExtractedColor[] = [];
  const secondary: ExtractedColor[] = [];
  const neutral: ExtractedColor[] = [];

  // Sort by frequency first
  const sortedByFreq = [...colors].sort((a, b) => b.frequency - a.frequency);

  for (const color of sortedByFreq) {
    const { saturation, brightness } = color;

    // Neutral: saturation < 10%
    if (saturation < 0.1) {
      if (neutral.length < 3) {
        neutral.push(color);
      }
      continue;
    }

    // Primary: highest frequency, saturation > 30%, not too dark/light
    if (primary.length < 2 && saturation > 0.3 && brightness > 0.15 && brightness < 0.95) {
      primary.push(color);
      continue;
    }

    // Secondary: medium saturation, distinct from primary
    if (secondary.length < 3 && saturation > 0.2 && saturation < 0.8) {
      // Check if distinct enough from primary colors
      let distinctEnough = true;
      for (const p of primary) {
        if (color.lab && p.lab) {
          const dist = colorDistance(color.lab, p.lab);
          if (dist < 30) {
            distinctEnough = false;
            break;
          }
        }
      }
      if (distinctEnough) {
        secondary.push(color);
      }
    }
  }

  return { primary, secondary, neutral };
};

export const extractColorsFromImage = async (
  imageUrl: string,
  colorCount: number = 8
): Promise<ExtractedColor[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Resize for performance
        const maxDimension = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Collect all valid pixels
        const pixelArray: Array<{ r: number; g: number; b: number }> = [];
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a < 128) continue;

          // Skip near-black and near-white
          const isNearBlack = r < 20 && g < 20 && b < 20;
          const isNearWhite = r > 245 && g > 245 && b > 245;
          if (isNearBlack || isNearWhite) continue;

          pixelArray.push({ r, g, b });
        }

        // Count frequencies
        const colorMap: Map<string, { r: number; g: number; b: number; count: number }> = new Map();
        for (const { r, g, b } of pixelArray) {
          // Light quantization for initial grouping
          const qr = Math.round(r / 8) * 8;
          const qg = Math.round(g / 8) * 8;
          const qb = Math.round(b / 8) * 8;
          const key = `${qr},${qg},${qb}`;

          const existing = colorMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorMap.set(key, { r: qr, g: qg, b: qb, count: 1 });
          }
        }

        // Convert to array and apply median cut
        const colorArray = Array.from(colorMap.values());
        const quantizedColors = medianCut(colorArray, 3); // 2^3 = 8 colors

        // Convert to ExtractedColor format
        let extractedColors: ExtractedColor[] = quantizedColors.map((color) => {
          const { r, g, b, count } = color;
          const metrics = getColorMetrics(r, g, b);
          return {
            rgb: [r, g, b] as [number, number, number],
            hex: rgbToHex(r, g, b),
            frequency: count,
            saturation: metrics.saturation,
            brightness: metrics.brightness,
            lab: rgbToLab(r, g, b),
          };
        });

        // Merge similar colors
        extractedColors = mergeSimilarColors(extractedColors);

        // Sort by saturation-weighted frequency (brand colors should be vibrant)
        extractedColors.sort((a, b) => {
          const scoreA = a.frequency * (0.3 + a.saturation * 0.7);
          const scoreB = b.frequency * (0.3 + b.saturation * 0.7);
          return scoreB - scoreA;
        });

        // Take top colors and categorize
        const topColors = extractedColors.slice(0, Math.min(colorCount, extractedColors.length));
        const categorized = categorizeColors(topColors);

        // Combine in order: primary, secondary, neutral
        const result: ExtractedColor[] = [
          ...categorized.primary,
          ...categorized.secondary,
          ...categorized.neutral,
        ];

        // Fill remaining slots if needed
        if (result.length < colorCount) {
          const remaining = topColors.filter(c => !result.includes(c));
          result.push(...remaining.slice(0, colorCount - result.length));
        }

        resolve(result.slice(0, colorCount));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};
