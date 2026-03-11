import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Heart,
  Download,
  Loader2,
  Image as ImageIcon,
  Search,
  Plus,
  BookOpen,
  Share2,
  FileText,
  Link2,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings,
  Palette,
  PenTool,
  Wand2,
  Gem,
  BarChart3,
  Shirt,
  Folder,
  Tags,
  Eye,
  Pencil,
  Save as SaveIcon,
  Copy,
  Check,
  RefreshCcw,
  Trash2,
  ImagePlus,
  ArrowRight,
  Moon,
  Sun,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// API Configuration - defaults to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type FeatureId =
  | 'prompt'
  | 'sketch'
  | 'palette'
  | 'restyle'
  | 'similarity'
  | 'outfitmatch'
  | 'occasion'
  | 'trends'
  | 'tryon'
  | 'mydesigns'
  | 'profile'
  | 'tags'
  | 'export';

type PaletteSource = 'design' | 'upload' | 'prompt';

interface PaletteRecord {
  id: string;
  name: string;
  colors: string[];
  createdAt: string;
  source: PaletteSource;
  sourceImage?: string | null;
  notes?: string;
}

interface AIDesignStudioProps {
  onAuthRequired: () => void;
}

type PaletteMood = 'Elegant' | 'Bold' | 'Soft' | 'Minimal';
type PaletteSeason = 'Summer' | 'Winter' | 'Festive' | 'Wedding';
type PaletteStyle = 'Casual' | 'Formal' | 'Streetwear' | 'Luxury';

interface PredefinedPalette {
  id: string;
  name: string;
  colors: string[];
  tags: {
    mood: PaletteMood;
    season: PaletteSeason;
    style: PaletteStyle;
  };
}

const clampColorCount = (count: number) => Math.min(Math.max(Math.round(count), 4), 6);

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((val) => Math.max(0, Math.min(255, Math.round(val))).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();

const hexToRgb = (hex: string): [number, number, number] | null => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r, g, b];
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      default:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: (h * 360 + 360) % 360,
    s: Math.min(Math.max(s, 0), 1),
    l: Math.min(Math.max(l, 0), 1),
  };
};

const hexToHsl = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb[0], rgb[1], rgb[2]);
};


type PaletteAdjustMode = 'brighten' | 'deepen' | 'muted' | 'pastel';

const adjustColor = (hex: string, mode: PaletteAdjustMode, amount: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex.toUpperCase();
  let target: [number, number, number];
  switch (mode) {
    case 'brighten':
      target = [255, 255, 255];
      break;
    case 'pastel':
      target = [255, 255, 255];
      amount = Math.min(1, amount + 0.1);
      break;
    case 'muted':
      target = [190, 190, 190];
      break;
    case 'deepen':
    default:
      target = [0, 0, 0];
      break;
  }
  const mixed = rgb.map((channel, index) =>
    Math.round(channel + (target[index] - channel) * Math.min(Math.max(amount, 0), 1))
  ) as [number, number, number];
  return rgbToHex(mixed[0], mixed[1], mixed[2]);
};

const adjustPaletteVariant = (colors: string[], mode: PaletteAdjustMode, amount: number) =>
  colors.map((color) => adjustColor(color, mode, amount));

interface PaletteSeed {
  id: string;
  name: string;
  colors: string[];
  tags: {
    mood: PaletteMood;
    season: PaletteSeason;
    style: PaletteStyle;
  };
}

interface PaletteVariantConfig {
  key: string;
  suffix: string;
  transform: (colors: string[]) => string[];
}

const curatedPaletteSeeds: PaletteSeed[] = [
  {
    id: 'elegant-winter-formal-01',
    name: 'Midnight Opera',
    colors: ['#0B1120', '#1E293B', '#334155', '#C4B5FD', '#F8FAFC'],
    tags: { mood: 'Elegant', season: 'Winter', style: 'Formal' },
  },
  {
    id: 'elegant-summer-luxury-01',
    name: 'Sunset Champagne',
    colors: ['#F2C14E', '#F78154', '#F2A7C4', '#FFE8D6', '#2F3E46'],
    tags: { mood: 'Elegant', season: 'Summer', style: 'Luxury' },
  },
  {
    id: 'elegant-wedding-formal-01',
    name: 'Ivory Symphony',
    colors: ['#F5F5F0', '#E0D3C3', '#C4B998', '#8C7A6B', '#3B3A40'],
    tags: { mood: 'Elegant', season: 'Wedding', style: 'Formal' },
  },
  {
    id: 'elegant-festive-luxury-01',
    name: 'Velvet Gala',
    colors: ['#2C1A27', '#4C1D95', '#7C3AED', '#F9A8D4', '#FDE68A'],
    tags: { mood: 'Elegant', season: 'Festive', style: 'Luxury' },
  },
  {
    id: 'bold-summer-streetwear-01',
    name: 'Tropical Rave',
    colors: ['#0EA5E9', '#22D3EE', '#F97316', '#F43F5E', '#FACC15'],
    tags: { mood: 'Bold', season: 'Summer', style: 'Streetwear' },
  },
  {
    id: 'bold-winter-streetwear-01',
    name: 'Neon Frost',
    colors: ['#0F172A', '#1D4ED8', '#06B6D4', '#34D399', '#FBBF24'],
    tags: { mood: 'Bold', season: 'Winter', style: 'Streetwear' },
  },
  {
    id: 'bold-festive-casual-01',
    name: 'Carnival Pulse',
    colors: ['#D61C4E', '#FF8C32', '#FFCD38', '#1F6F78', '#1E1E2C'],
    tags: { mood: 'Bold', season: 'Festive', style: 'Casual' },
  },
  {
    id: 'bold-wedding-formal-01',
    name: 'Crimson Statement',
    colors: ['#7F1D1D', '#DC2626', '#FCA5A5', '#FDE68A', '#1C1917'],
    tags: { mood: 'Bold', season: 'Wedding', style: 'Formal' },
  },
  {
    id: 'soft-summer-casual-01',
    name: 'Blush Breeze',
    colors: ['#FFE5EC', '#FFC2D1', '#FFB3C6', '#BDE0FE', '#A2D2FF'],
    tags: { mood: 'Soft', season: 'Summer', style: 'Casual' },
  },
  {
    id: 'soft-winter-minimal-01',
    name: 'Powder Whisper',
    colors: ['#F0F4F8', '#E2E8F0', '#CBD5F5', '#94A3B8', '#475569'],
    tags: { mood: 'Soft', season: 'Winter', style: 'Formal' },
  },
  {
    id: 'soft-wedding-luxury-01',
    name: 'Petal Lace',
    colors: ['#FFF1F2', '#FBCFE8', '#F5D0FE', '#FDE68A', '#A855F7'],
    tags: { mood: 'Soft', season: 'Wedding', style: 'Luxury' },
  },
  {
    id: 'soft-festive-formal-01',
    name: 'Champagne Glow',
    colors: ['#FFF7E8', '#FDE1AF', '#F9A27B', '#8EC5FC', '#C1A3FF'],
    tags: { mood: 'Soft', season: 'Festive', style: 'Formal' },
  },
  {
    id: 'minimal-summer-casual-01',
    name: 'Coastal Linen',
    colors: ['#F7F7F2', '#E5E9E2', '#C9D6CF', '#8DA1A6', '#3B5360'],
    tags: { mood: 'Minimal', season: 'Summer', style: 'Casual' },
  },
  {
    id: 'minimal-winter-formal-01',
    name: 'Slate Tailor',
    colors: ['#111827', '#1F2937', '#374151', '#4B5563', '#9CA3AF'],
    tags: { mood: 'Minimal', season: 'Winter', style: 'Formal' },
  },
  {
    id: 'minimal-festive-luxury-01',
    name: 'Pearl Minimal',
    colors: ['#FAF7F0', '#E0E0E0', '#C0C0C0', '#909090', '#303030'],
    tags: { mood: 'Minimal', season: 'Festive', style: 'Luxury' },
  },
  {
    id: 'minimal-wedding-formal-01',
    name: 'Silk Ceremony',
    colors: ['#FDFCFB', '#E9E4D4', '#CECAC1', '#9C9A93', '#4A4A4A'],
    tags: { mood: 'Minimal', season: 'Wedding', style: 'Formal' },
  },
  {
    id: 'elegant-summer-streetwear-01',
    name: 'Gilded Streets',
    colors: ['#1F2933', '#334155', '#F97316', '#FBBF24', '#FDE68A'],
    tags: { mood: 'Elegant', season: 'Summer', style: 'Streetwear' },
  },
  {
    id: 'bold-summer-formal-01',
    name: 'Aurora Runway',
    colors: ['#3B82F6', '#9333EA', '#F43F5E', '#F97316', '#FACC15'],
    tags: { mood: 'Bold', season: 'Summer', style: 'Formal' },
  },
  {
    id: 'soft-summer-luxury-01',
    name: 'Seaside Sorbet',
    colors: ['#FEE2E2', '#FBCFE8', '#BFDBFE', '#BAE6FD', '#D9F99D'],
    tags: { mood: 'Soft', season: 'Summer', style: 'Luxury' },
  },
  {
    id: 'minimal-summer-streetwear-01',
    name: 'Urban Canvas',
    colors: ['#0F172A', '#1E293B', '#E2E8F0', '#9CA3AF', '#F1F5F9'],
    tags: { mood: 'Minimal', season: 'Summer', style: 'Streetwear' },
  },
  {
    id: 'elegant-winter-luxury-01',
    name: 'Glacier Couture',
    colors: ['#0B1120', '#1E293B', '#475569', '#94A3B8', '#E2E8F0'],
    tags: { mood: 'Elegant', season: 'Winter', style: 'Luxury' },
  },
  {
    id: 'bold-festive-luxury-01',
    name: 'Electric Soirée',
    colors: ['#1C1917', '#7C3AED', '#EC4899', '#F97316', '#FACC15'],
    tags: { mood: 'Bold', season: 'Festive', style: 'Luxury' },
  },
  {
    id: 'soft-winter-casual-01',
    name: 'Frosted Knit',
    colors: ['#E0F2FE', '#BAE6FD', '#CFFAFE', '#FDE68A', '#F5F5F5'],
    tags: { mood: 'Soft', season: 'Winter', style: 'Casual' },
  },
  {
    id: 'minimal-festive-casual-01',
    name: 'Graphite Spark',
    colors: ['#111827', '#1F2937', '#374151', '#FACC15', '#FDE68A'],
    tags: { mood: 'Minimal', season: 'Festive', style: 'Casual' },
  },
  {
    id: 'elegant-wedding-luxury-01',
    name: 'Crystal Ballroom',
    colors: ['#F8FAFC', '#E2E8F0', '#C7D2FE', '#A5B4FC', '#6366F1'],
    tags: { mood: 'Elegant', season: 'Wedding', style: 'Luxury' },
  },
];

const paletteVariantConfigs: PaletteVariantConfig[] = [
  {
    key: 'core',
    suffix: '',
    transform: (colors) => colors,
  },
  {
    key: 'luminous',
    suffix: ' Luminous',
    transform: (colors) => adjustPaletteVariant(colors, 'brighten', 0.15),
  },
  {
    key: 'muted',
    suffix: ' Muted',
    transform: (colors) => adjustPaletteVariant(colors, 'muted', 0.2),
  },
  {
    key: 'rich',
    suffix: ' Rich',
    transform: (colors) => adjustPaletteVariant(colors, 'deepen', 0.18),
  },
  {
    key: 'pastel',
    suffix: ' Pastel',
    transform: (colors) => adjustPaletteVariant(colors, 'pastel', 0.3),
  },
];

const curatedPaletteLibrary: PredefinedPalette[] = paletteVariantConfigs.flatMap((variant) =>
  curatedPaletteSeeds.map((seed) => ({
    id: `${seed.id}-${variant.key}`,
    name: variant.suffix ? `${seed.name}${variant.suffix}` : seed.name,
    colors: variant.transform(seed.colors),
    tags: seed.tags,
  }))
);

const paletteMoodFilters: (PaletteMood | 'All')[] = ['All', 'Elegant', 'Bold', 'Soft', 'Minimal'];
const paletteSeasonFilters: (PaletteSeason | 'All')[] = ['All', 'Summer', 'Winter', 'Festive', 'Wedding'];
const paletteStyleFilters: (PaletteStyle | 'All')[] = ['All', 'Casual', 'Formal', 'Streetwear', 'Luxury'];

const keywordTagMap: Record<
  string,
  Partial<{ moods: PaletteMood[]; seasons: PaletteSeason[]; styles: PaletteStyle[] }>
> = {
  sunset: { moods: ['Bold', 'Elegant'], seasons: ['Summer'], styles: ['Luxury', 'Streetwear'] },
  sunrise: { moods: ['Soft', 'Elegant'], seasons: ['Summer'], styles: ['Casual'] },
  dusk: { moods: ['Elegant'], seasons: ['Summer', 'Winter'], styles: ['Formal'] },
  wedding: { moods: ['Elegant', 'Soft'], seasons: ['Wedding'], styles: ['Formal', 'Luxury'] },
  bridal: { moods: ['Elegant', 'Soft'], seasons: ['Wedding'], styles: ['Formal', 'Luxury'] },
  forest: { moods: ['Minimal', 'Soft'], seasons: ['Winter', 'Summer'], styles: ['Casual'] },
  nature: { moods: ['Minimal', 'Soft'], seasons: ['Summer'], styles: ['Casual'] },
  jungle: { moods: ['Bold'], seasons: ['Summer'], styles: ['Streetwear', 'Casual'] },
  pastel: { moods: ['Soft'], seasons: ['Summer', 'Wedding'], styles: ['Luxury', 'Casual'] },
  neon: { moods: ['Bold'], seasons: ['Summer', 'Festive'], styles: ['Streetwear'] },
  winter: { moods: ['Elegant', 'Minimal', 'Soft'], seasons: ['Winter'], styles: ['Formal', 'Luxury'] },
  summer: { moods: ['Bold', 'Soft', 'Minimal'], seasons: ['Summer'], styles: ['Casual', 'Streetwear'] },
  festive: { moods: ['Bold', 'Elegant'], seasons: ['Festive'], styles: ['Luxury', 'Formal'] },
  luxe: { moods: ['Elegant'], styles: ['Luxury'] },
  luxury: { moods: ['Elegant'], styles: ['Luxury'] },
  streetwear: { moods: ['Bold', 'Minimal'], styles: ['Streetwear'] },
  casual: { moods: ['Soft', 'Minimal'], styles: ['Casual'] },
  formal: { moods: ['Elegant'], styles: ['Formal'] },
};

const keywordSynonyms: Record<string, string[]> = {
  wedding: ['bridal', 'ceremony', 'marriage'],
  sunset: ['sunrise', 'dawn', 'dusk', 'golden'],
  forest: ['nature', 'woods', 'jungle', 'evergreen'],
  pastel: ['soft', 'muted', 'delicate'],
  neon: ['electric', 'vibrant'],
  winter: ['snow', 'frost', 'ice'],
  summer: ['sunny', 'tropical', 'vacation'],
  luxury: ['luxe', 'couture'],
};

const warmHue = (hue: number) => hue <= 60 || hue >= 300;
const greenHue = (hue: number) => hue >= 80 && hue <= 160;

const computeColorSemanticScore = (palette: PredefinedPalette, keyword: string) => {
  const hues = palette.colors
    .map((hex) => hexToHsl(hex))
    .filter((value): value is { h: number; s: number; l: number } => Boolean(value));
  if (!hues.length) return 0;
  const keywordLower = keyword.toLowerCase();
  const warmRatio = hues.filter(({ h }) => warmHue(h)).length / hues.length;
  const greenRatio = hues.filter(({ h }) => greenHue(h)).length / hues.length;
  const pastelRatio =
    hues.filter(({ s, l }) => s <= 0.55 && l >= 0.7).length / hues.length;
  const brightRatio = hues.filter(({ l }) => l >= 0.8).length / hues.length;

  if (['sunset', 'sunrise', 'dawn', 'dusk', 'golden'].includes(keywordLower)) {
    return warmRatio * 8 + brightRatio * 2;
  }
  if (['forest', 'nature', 'woods', 'jungle', 'evergreen'].includes(keywordLower)) {
    return greenRatio * 10 + pastelRatio * 2;
  }
  if (['pastel', 'soft', 'muted', 'delicate'].includes(keywordLower)) {
    return pastelRatio * 12 + brightRatio * 2;
  }
  if (['wedding', 'bridal', 'ceremony', 'marriage'].includes(keywordLower)) {
    return brightRatio * 6 + pastelRatio * 6;
  }
  if (['neon', 'electric', 'vibrant'].includes(keywordLower)) {
    const vividRatio =
      hues.filter(({ s, l }) => s >= 0.65 && l >= 0.45 && l <= 0.75).length / hues.length;
    return vividRatio * 10 + warmRatio * 2;
  }
  if (['winter', 'snow', 'frost', 'ice'].includes(keywordLower)) {
    const coolRatio = hues.filter(({ h }) => h >= 160 && h <= 260).length / hues.length;
    return coolRatio * 8 + brightRatio * 4;
  }
  return 0;
};

const expandKeyword = (keyword: string) => {
  const lower = keyword.toLowerCase();
  const synonyms = keywordSynonyms[lower] ?? [];
  return [lower, ...synonyms];
};

const scorePaletteForKeywords = (palette: PredefinedPalette, keywords: string[]) => {
  let score = 0;
  const paletteName = palette.name.toLowerCase();
  const paletteTags = [
    palette.tags.mood.toLowerCase(),
    palette.tags.season.toLowerCase(),
    palette.tags.style.toLowerCase(),
  ];

  keywords.forEach((keyword) => {
    const variants = expandKeyword(keyword);
    variants.forEach((variant) => {
      if (!variant) return;
      if (paletteName.includes(variant)) score += 8;
      if (paletteTags.includes(variant)) score += 6;

      const tagRule = keywordTagMap[variant];
      if (tagRule) {
        if (tagRule.moods?.includes(palette.tags.mood)) score += 4;
        if (tagRule.seasons?.includes(palette.tags.season)) score += 4;
        if (tagRule.styles?.includes(palette.tags.style)) score += 4;
      }

      score += computeColorSemanticScore(palette, variant);
    });
  });

  return score;
};

const selectPalettesForKeywords = (query: string, limit = 6) => {
  const keywords = query
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((word) => word.trim())
    .filter(Boolean);
  if (!keywords.length) return [] as PredefinedPalette[];

  const scored = curatedPaletteLibrary
    .map((palette) => ({ palette, score: scorePaletteForKeywords(palette, keywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.palette.name.localeCompare(b.palette.name);
      }
      return b.score - a.score;
    });

  return scored.slice(0, limit).map(({ palette }) => palette);
};

const colorDistance = (a: number[], b: number[]) =>
  Math.sqrt(
    (a[0] - b[0]) * (a[0] - b[0]) +
      (a[1] - b[1]) * (a[1] - b[1]) +
      (a[2] - b[2]) * (a[2] - b[2])
  );

const runKMeans = (pixels: number[][], k: number, maxIterations = 8) => {
  if (pixels.length === 0) return [] as { color: number[]; count: number }[];

  const centroids: number[][] = [];
  for (let i = 0; i < k; i += 1) {
    const randomIndex = Math.floor(Math.random() * pixels.length);
    centroids.push([...pixels[randomIndex]]);
  }

  const assignments = new Array(pixels.length).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let changed = false;
    const clusterCounts = new Array(k).fill(0);
    const clusterSums = Array.from({ length: k }, () => [0, 0, 0]);

    for (let i = 0; i < pixels.length; i += 1) {
      let bestIndex = 0;
      let bestDistance = Infinity;
      for (let j = 0; j < k; j += 1) {
        const dist = colorDistance(pixels[i], centroids[j]);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestIndex = j;
        }
      }
      if (assignments[i] !== bestIndex) {
        changed = true;
        assignments[i] = bestIndex;
      }
      clusterCounts[bestIndex] += 1;
      clusterSums[bestIndex][0] += pixels[i][0];
      clusterSums[bestIndex][1] += pixels[i][1];
      clusterSums[bestIndex][2] += pixels[i][2];
    }

    for (let c = 0; c < k; c += 1) {
      if (clusterCounts[c] === 0) {
        const randomIndex = Math.floor(Math.random() * pixels.length);
        centroids[c] = [...pixels[randomIndex]];
        continue;
      }
      centroids[c] = [
        clusterSums[c][0] / clusterCounts[c],
        clusterSums[c][1] / clusterCounts[c],
        clusterSums[c][2] / clusterCounts[c],
      ];
    }

    if (!changed) break;
  }

  const counts = new Array(k).fill(0);
  assignments.forEach((cluster) => {
    counts[cluster] += 1;
  });

  return centroids
    .map((centroid, index) => ({ color: centroid, count: counts[index] }))
    .sort((a, b) => b.count - a.count);
};

const extractPaletteFromImage = async (imageSrc: string, colorCount: number) =>
  new Promise<string[]>((resolve, reject) => {
    const image = new Image();
    
    // Only set crossOrigin for external URLs, not for blob URLs or data URLs
    if (!imageSrc.startsWith('blob:') && !imageSrc.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }
    
    image.onload = () => {
      try {
        console.log('Image loaded successfully, size:', image.width, 'x', image.height);
        const maxSide = 600;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          reject(new Error('Canvas rendering is not supported in this environment'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels: number[][] = [];
        const targetSamples = 12000;
        const step = Math.max(1, Math.floor((data.length / 4) / targetSamples));
        for (let index = 0; index < data.length; index += step * 4) {
          const alpha = data[index + 3];
          if (alpha < 200) continue;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          pixels.push([r, g, b]);
        }

        if (!pixels.length) {
          reject(new Error('No color data found in image'));
          return;
        }

        const clusters = runKMeans(pixels, clampColorCount(colorCount));
        const palette = clusters
          .map(({ color }) => rgbToHex(color[0], color[1], color[2]))
          .filter((hex, index, array) => array.indexOf(hex) === index);

        while (palette.length < clampColorCount(colorCount)) {
          const fallback = pixels[Math.floor(Math.random() * pixels.length)];
          palette.push(rgbToHex(fallback[0], fallback[1], fallback[2]));
          if (palette.length >= clampColorCount(colorCount)) break;
        }

        resolve(palette.slice(0, clampColorCount(colorCount)));
      } catch (error) {
        console.error('Error processing image data:', error);
        reject(error instanceof Error ? error : new Error('Failed to read image data for palette extraction'));
      }
    };
    
    image.onerror = (e) => {
      console.error('Image failed to load:', e, 'URL:', imageSrc);
      reject(new Error('Failed to load image for palette extraction. Check if the image URL is accessible.'));
    };
    
    console.log('Loading image from:', imageSrc);
    image.src = imageSrc;
  });

export const AIDesignStudio = ({ onAuthRequired }: AIDesignStudioProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    designs: string[];
    palettes: PaletteRecord[];
    features: FeatureId[];
  }>({ designs: [], palettes: [], features: [] });
  
  // AI Generation Form Fields
  const [topwear, setTopwear] = useState('');
  const [bottomwear, setBottomwear] = useState('');
  const [accessories, setAccessories] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const paletteCopyTimeoutRef = useRef<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureId>('prompt');
  const [stylePreset, setStylePreset] = useState('Minimalist');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Color Palette Studio state
  const [palettePrompt, setPalettePrompt] = useState('');
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#D946EF',
    '#F97316',
    '#22C55E',
    '#06B6D4',
    '#3B82F6',
    '#F43F5E',
  ]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [paletteTargetDesign, setPaletteTargetDesign] = useState<string | null>(null);
  const [palettePreviewImage, setPalettePreviewImage] = useState<string | null>(null);
  const [paletteImagePreview, setPaletteImagePreview] = useState<string | null>(null);
  const [paletteUploadObjectUrl, setPaletteUploadObjectUrl] = useState<string | null>(null);
  const [paletteSourceType, setPaletteSourceType] = useState<PaletteSource>('prompt');
  const [isPaletteLoading, setIsPaletteLoading] = useState(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);
  const [paletteName, setPaletteName] = useState('');
  const [savedPalettes, setSavedPalettes] = useState<PaletteRecord[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [paletteSaveMessage, setPaletteSaveMessage] = useState<string | null>(null);
  const [paletteMoodFilter, setPaletteMoodFilter] = useState<(PaletteMood | 'All')>('All');
  const [paletteSeasonFilter, setPaletteSeasonFilter] = useState<(PaletteSeason | 'All')>('All');
  const [paletteStyleFilter, setPaletteStyleFilter] = useState<(PaletteStyle | 'All')>('All');
  const [paletteKeywordMatches, setPaletteKeywordMatches] = useState<PredefinedPalette[]>([]);
  const [paletteKeywordQuery, setPaletteKeywordQuery] = useState('');

  const paletteStorageKey = user ? `fashion-ai-palettes-${user.id ?? user.email ?? 'default'}` : null;

  const persistPalettes = (palettes: PaletteRecord[]) => {
    if (!paletteStorageKey || typeof window === 'undefined') return;
    try {
      const safePalettes = palettes.map((palette) =>
        palette.source === 'upload' && palette.sourceImage?.startsWith('blob:')
          ? { ...palette, sourceImage: null }
          : palette
      );
      window.localStorage.setItem(paletteStorageKey, JSON.stringify(safePalettes));
    } catch (error) {
      console.warn('Unable to persist palettes', error);
    }
  };
  // Sketch-to-Design state
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);
  const [sketchMode, setSketchMode] = useState<'line' | 'color' | 'enhanced'>('line');
  const [designFromSketchUrl, setDesignFromSketchUrl] = useState<string | null>(null);
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [isGeneratingSketch, setIsGeneratingSketch] = useState(false);
  const [sketchPrompt, setSketchPrompt] = useState('Professional fashion design, photorealistic, high quality, studio lighting');

  // AI Restyle state
  const [restyleSource, setRestyleSource] = useState<string | null>(null);
  const [restyleUploadedImage, setRestyleUploadedImage] = useState<string | null>(null);
  const [restyleUploadedFile, setRestyleUploadedFile] = useState<File | null>(null);
  const [restylePrompt, setRestylePrompt] = useState(
    'Convert this outfit into vintage evening wear'
  );
  const [variation, setVariation] = useState(55);
  const [restyledUrl, setRestyledUrl] = useState<string | null>(null);
  const [isRestyling, setIsRestyling] = useState(false);
  const [restyleError, setRestyleError] = useState<string | null>(null);

  // AI Similarity Search state
  const [similaritySearchMode, setSimilaritySearchMode] = useState<'text' | 'image'>('text');
  const [similarityCategory, setSimilarityCategory] = useState('');
  const [similarityStyle, setSimilarityStyle] = useState('');
  const [similarityColor, setSimilarityColor] = useState('');
  const [similarityGender, setSimilarityGender] = useState('');
  const [similarityOccasion, setSimilarityOccasion] = useState('');
  const [similarityDescription, setSimilarityDescription] = useState('');
  const [similarityImageFile, setSimilarityImageFile] = useState<File | null>(null);
  const [similarityImagePreview, setSimilarityImagePreview] = useState<string | null>(null);
  const [similarityResults, setSimilarityResults] = useState<any[]>([]);
  const [isSimilaritySearching, setIsSimilaritySearching] = useState(false);
  const [similarityError, setSimilarityError] = useState<string | null>(null);
  const similarityFileInputRef = useRef<HTMLInputElement | null>(null);

  // Outfit Matching state
  const [outfitMatchImageFile, setOutfitMatchImageFile] = useState<File | null>(null);
  const [outfitMatchImagePreview, setOutfitMatchImagePreview] = useState<string | null>(null);
  const [outfitMatchResults, setOutfitMatchResults] = useState<{ [key: string]: any[] }>({});
  const [isOutfitMatching, setIsOutfitMatching] = useState(false);
  const [outfitMatchError, setOutfitMatchError] = useState<string | null>(null);
  const outfitMatchFileInputRef = useRef<HTMLInputElement | null>(null);

  // Trends state
  const [trendsView, setTrendsView] = useState<'global' | 'personal'>('global');
  const [trendsData, setTrendsData] = useState<any>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  // Smart Occasion Styling state
  const [occasionOccasion, setOccasionOccasion] = useState<'casual' | 'party' | 'formal' | 'sports'>('casual');
  const [occasionStyle, setOccasionStyle] = useState<'casual' | 'streetwear' | 'elegant' | 'sporty' | 'minimal'>('casual');
  const [occasionGender, setOccasionGender] = useState<'male' | 'female'>('female');
  const [occasionSeason, setOccasionSeason] = useState<'summer' | 'winter' | 'all'>('all');
  const [occasionColor, setOccasionColor] = useState<'light' | 'dark' | 'neutral' | 'any'>('any');
  const [occasionType, setOccasionType] = useState<'top-bottom' | 'dress' | 'full-outfit'>('top-bottom');
  const [occasionResults, setOccasionResults] = useState<any[]>([]);
  const [isGeneratingOccasion, setIsGeneratingOccasion] = useState(false);
  const [occasionError, setOccasionError] = useState<string | null>(null);

  // Profile state
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState('');

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    }
    return false;
  });

  // Prompt settings (commonly used for text-to-image models; stored for UI now)
  // Color adjustments for generated previews (applies to Prompt-based Design)
  const [applyColorAdjustments] = useState(false);
  const [hue] = useState(0); // 0-360
  const [saturation] = useState(100); // %
  const [brightness] = useState(100); // %
  const imageFilterCSS = () =>
    `hue-rotate(${hue}deg) saturate(${saturation / 100}) brightness(${brightness / 100})`;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#studio-export-menu')) setIsExportOpen(false);
      if (!target.closest('#studio-user-menu')) setIsUserMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Fetch saved designs when user logs in
  useEffect(() => {
    const fetchSavedDesigns = async () => {
      if (!isAuthenticated) {
        setSavedDesigns([]);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/api/user/saved-designs`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSavedDesigns(data.savedDesigns || []);
        }
      } catch (error) {
        console.error('Failed to fetch saved designs:', error);
      }
    };

    fetchSavedDesigns();
  }, [isAuthenticated]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    return () => {
      if (paletteCopyTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(paletteCopyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!paletteStorageKey || typeof window === 'undefined') {
      setSavedPalettes([]);
      return;
    }
    try {
      const stored = window.localStorage.getItem(paletteStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPalettes(parsed as PaletteRecord[]);
        } else {
          setSavedPalettes([]);
        }
      } else {
        setSavedPalettes([]);
      }
    } catch (error) {
      console.warn('Unable to load saved palettes', error);
      setSavedPalettes([]);
    }
  }, [paletteStorageKey]);

  useEffect(() => {
    if (!paletteSaveMessage || typeof window === 'undefined') return;
    const timeout = window.setTimeout(() => setPaletteSaveMessage(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [paletteSaveMessage]);

  useEffect(() => {
    return () => {
      if (paletteUploadObjectUrl) {
        URL.revokeObjectURL(paletteUploadObjectUrl);
      }
    };
  }, [paletteUploadObjectUrl]);

  const trackSearch = async (searchData: any) => {
    if (!isAuthenticated) return;
    
    try {
      await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(searchData),
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  };

  const fetchTrends = async (view: 'global' | 'personal') => {
    if (!isAuthenticated) return;
    
    setIsLoadingTrends(true);
    setTrendsError(null);
    try {
      const endpoint = view === 'global' 
        ? `${API_URL}/api/analytics/trends/global`
        : `${API_URL}/api/analytics/trends/personal`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }

      const data = await response.json();
      
      // Use data directly as backend now returns correct structure
      setTrendsData(data);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      setTrendsError('Unable to load trends. Please try again later.');
      setTrendsData(null);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // Fetch trends only once when user opens trends dashboard
  useEffect(() => {
    if (activeFeature === 'trends' && !trendsData) {
      fetchTrends(trendsView);
    }
  }, [activeFeature]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    // Validate required fields
    if (!topwear.trim() || !bottomwear.trim()) {
      setGenerationError('Please fill in both topwear and bottomwear fields');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Submit generation job
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          topwear: topwear.trim(),
          bottomwear: bottomwear.trim(),
          accessories: accessories.trim() || undefined,
          style: designStyle.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start generation');
      }

      const jobData = await response.json();
      
      if (!jobData.job_id) {
        throw new Error('No job ID received from server');
      }

      console.log('Generation job started:', jobData.job_id);

      // Poll for job completion
      const pollInterval = 2000; // Poll every 2 seconds
      const maxAttempts = 150; // 5 minutes max (150 * 2 seconds)
      let attempts = 0;

      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          throw new Error('Generation timed out. Please try again.');
        }

        attempts++;

        const statusResponse = await fetch(
          `${API_URL}/api/ai/generate/status/${jobData.job_id}`,
          {
            credentials: 'include',
          }
        );

        if (!statusResponse.ok) {
          throw new Error('Failed to check generation status');
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          // Success! Add image to list
          const imageUrl = statusData.result.image_url.startsWith('http') 
            ? statusData.result.image_url 
            : `${API_URL}${statusData.result.image_url}`;
          setGeneratedImages([imageUrl, ...generatedImages]);
          
          // Track search for analytics
          trackSearch({
            searchType: 'design',
            topwear: topwear.trim(),
            bottomwear: bottomwear.trim(),
            accessories: accessories.trim() || undefined,
            style: designStyle.trim() || undefined,
          });
          
          // Clear form fields
          setTopwear('');
          setBottomwear('');
          setAccessories('');
          setDesignStyle('');
          
          console.log('Generation completed:', statusData.result.image_url);
          return; // Exit polling loop
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Generation failed');
        } else {
          // Still processing, poll again
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          await poll();
        }
      };

      await poll();
      
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate design. Please make sure the AI service is running.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToWishlist = async (image: string) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (savedDesigns.includes(image)) return;

    try {
      const response = await fetch(`${API_URL}/api/user/saved-designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageUrl: image }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedDesigns(data.savedDesigns || []);
      }
    } catch (error) {
      console.error('Failed to save design:', error);
    }
  };

  const handleNewDesign = () => {
    setTopwear('');
    setBottomwear('');
    setAccessories('');
    setDesignStyle('');
    setGeneratedImages([]);
    setActiveFeature('prompt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadClick = () => {
    uploadRef.current?.click();
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload functionality not implemented in structured form
      console.log('File selected:', file.name);
    }
  };

  const handleExport = (type: 'png' | 'pdf' | 'link') => {
    if (type === 'link') {
      const shareUrl = `${window.location.origin}/?shared=design-${Date.now()}`;
      navigator.clipboard?.writeText(shareUrl).catch(() => {});
    }
    setIsExportOpen(false);
  };

  // Helpers: Feature actions
  const randomHex = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`.toUpperCase();

  const generatePromptPalette = (seed: string, count = 6) => {
    const normalizedSeed = seed || 'fashion';
    let hash = 0;
    for (let i = 0; i < normalizedSeed.length; i += 1) {
      hash = (hash * 31 + normalizedSeed.charCodeAt(i)) & 0xffffffff;
    }
    const palette: string[] = [];
    const targetCount = clampColorCount(count);
    for (let index = 0; index < targetCount; index += 1) {
      hash = (hash * 1664525 + 1013904223) & 0xffffffff;
      const r = (hash >> 16) & 0xff;
      const g = (hash >> 8) & 0xff;
      const b = hash & 0xff;
      palette.push(rgbToHex(r, g, b));
    }
    return palette;
  };

  const applyPaletteState = (colors: string[], source: PaletteSource, preview: string | null = null) => {
    if (!colors.length) return;
    const normalized = colors
      .map((hex) => (hex.startsWith('#') ? hex : `#${hex}`))
      .map((hex) => hex.slice(0, 7).toUpperCase())
      .filter((hex) => /^#[0-9A-F]{6}$/.test(hex));
    if (!normalized.length) return;
    const deduped = normalized.filter((hex, index, array) => array.indexOf(hex) === index);
    const desiredCount = clampColorCount(deduped.length || colors.length || 6);
    const limited = deduped.slice(0, desiredCount);
    while (limited.length < 4) {
      const candidate = randomHex();
      if (!limited.includes(candidate)) limited.push(candidate);
    }
    setPaletteColors(limited);
    setPaletteSourceType(source);
    setSelectedColor(limited[0] ?? null);
    setPalettePreviewImage(preview ?? null);
    setPaletteError(null);
    setPaletteSaveMessage(null);
  };

  const generateRandomPalette = (count = 6) => {
    const palette = Array.from({ length: clampColorCount(count) }).map(() => randomHex());
    applyPaletteState(palette, 'prompt');
    return palette;
  };

  const handleGeneratePaletteFromPrompt = () => {
    const base = palettePrompt.trim();
    if (!base) {
      setPaletteKeywordMatches([]);
      setPaletteKeywordQuery('');
      generateRandomPalette(6);
      return;
    }
    const matches = selectPalettesForKeywords(base, 6);
    if (matches.length > 0) {
      setPaletteKeywordMatches(matches);
      setPaletteKeywordQuery(base);
      const primary = matches[0];
      applyPaletteState(primary.colors, 'prompt');
      setPaletteName(primary.name);
      setPaletteSaveMessage(`Palette matched "${primary.name}".`);
      setPaletteError(null);
      return;
    }
    setPaletteKeywordMatches([]);
    setPaletteKeywordQuery(base);
    const palette = generatePromptPalette(base, 6);
    applyPaletteState(palette, 'prompt');
    setPaletteError(null);
  };

  const handlePaletteExtraction = async (imageSrc: string, source: PaletteSource, count = 6) => {
    setIsPaletteLoading(true);
    setPaletteError(null);
    try {
      console.log('Extracting palette from:', imageSrc);
      
      // For backend images, fetch as blob first to avoid CORS issues
      let imageUrlToUse = imageSrc;
      if (imageSrc.includes('localhost') || imageSrc.includes('127.0.0.1')) {
        try {
          console.log('Fetching image as blob from backend...');
          const response = await fetch(imageSrc, { mode: 'cors' });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          imageUrlToUse = URL.createObjectURL(blob);
          console.log('Successfully converted to blob URL:', imageUrlToUse);
        } catch (fetchError) {
          console.error('Failed to fetch image as blob:', fetchError);
          console.log('Falling back to direct URL');
        }
      }
      
      const colors = await extractPaletteFromImage(imageUrlToUse, count);
      console.log('Extracted colors:', colors);
      
      applyPaletteState(colors, source, imageSrc);
      if (source === 'design') {
        setPaletteTargetDesign(imageSrc);
      }
      if (source === 'upload') {
        setPaletteImagePreview(imageSrc);
      }
      
      // Clean up blob URL if created
      if (imageUrlToUse !== imageSrc) {
        URL.revokeObjectURL(imageUrlToUse);
      }
    } catch (error) {
      console.error('Palette extraction error:', error);
      setPaletteError(error instanceof Error ? error.message : 'Unable to extract colors from the image.');
    } finally {
      setIsPaletteLoading(false);
    }
  };

  const handleDesignPaletteExtraction = () => {
    if (!paletteTargetDesign) {
      setPaletteError('Select a generated design before extracting colors.');
      return;
    }
    setPaletteImagePreview(null);
    setPaletteUploadObjectUrl(null);
    handlePaletteExtraction(paletteTargetDesign, 'design', 6);
  };

  const handlePaletteUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPaletteUploadObjectUrl(objectUrl);
    setPaletteTargetDesign(null);
    // Don't extract automatically - wait for button click
    event.target.value = '';
  };

  const handleUploadPaletteExtraction = () => {
    if (!paletteUploadObjectUrl) return;
    handlePaletteExtraction(paletteUploadObjectUrl, 'upload', 6);
  };

  const handleApplyColorToDesign = (color: string) => {
    setSelectedColor(color);
    if (activeFeature === 'prompt') {
      // Apply color to style field in structured form
      setDesignStyle((prev) => prev ? `${prev}, ${color} tones` : `${color} tones`);
    }
  };

  const tagPaletteOnPrompt = (colors: string[], label?: string) => {
    if (!colors.length) return;
    const descriptor = `${label ? `${label}: ` : ''}${colors.join(', ')}`;
    // Apply palette colors to style field in structured form
    setDesignStyle((prev) => {
      if (!prev) return `Design featuring palette ${descriptor}`;
      if (prev.includes(descriptor)) return prev;
      return `${prev}\nPalette: ${descriptor}`;
    });
  };

  const handleApplyPaletteToDesign = () => {
    if (!paletteColors.length) {
      setPaletteError('Generate or extract a palette first.');
      return;
    }
    tagPaletteOnPrompt(paletteColors);
    setPaletteError(null);
    setPaletteSaveMessage('Palette applied to current design prompt.');
  };

  const handleSendPaletteToPromptDesigner = () => {
    if (!paletteColors.length) {
      setPaletteError('Generate or extract a palette first.');
      return;
    }
    tagPaletteOnPrompt(paletteColors, paletteName.trim() || undefined);
    setActiveFeature('prompt');
    setPaletteError(null);
    setPaletteSaveMessage('Palette added to Prompt-based Design.');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyHex = async (hex: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      if (paletteCopyTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(paletteCopyTimeoutRef.current);
      }
      if (typeof window !== 'undefined') {
        paletteCopyTimeoutRef.current = window.setTimeout(() => setCopiedHex(null), 1800);
      }
    } catch (error) {
      console.warn('Failed to copy color', error);
    }
  };

  const handleSaveCurrentPalette = () => {
    if (!paletteColors.length) {
      setPaletteSaveMessage('Generate a palette before saving.');
      return;
    }
    const name = paletteName.trim() || `Palette ${savedPalettes.length + 1}`;
    const record: PaletteRecord = {
      id: `pal-${Date.now()}`,
      name,
      colors: paletteColors,
      createdAt: new Date().toISOString(),
      source: paletteSourceType,
      sourceImage:
        paletteSourceType === 'design'
          ? palettePreviewImage ?? paletteTargetDesign
          : paletteSourceType === 'upload'
          ? paletteImagePreview
          : null,
    };
    const next = [record, ...savedPalettes].slice(0, 24);
    setSavedPalettes(next);
    persistPalettes(next);
    setPaletteName('');
    setPaletteSaveMessage('Palette saved to My Palettes.');
  };

  const handleApplyPredefinedPalette = (palette: PredefinedPalette) => {
    applyPaletteState(palette.colors, 'prompt');
    tagPaletteOnPrompt(palette.colors, palette.name);
    setPaletteName(palette.name);
    setPaletteSaveMessage(`Applied ${palette.name}.`);
  };

  const handleSavePaletteFromLibrary = (palette: PredefinedPalette) => {
    const exists = savedPalettes.some(
      (record) =>
        record.name === palette.name && record.colors.join('|') === palette.colors.join('|')
    );
    if (exists) {
      setPaletteSaveMessage('Palette already saved to your library.');
      return;
    }
    const record: PaletteRecord = {
      id: `pal-${Date.now()}`,
      name: palette.name,
      colors: palette.colors,
      createdAt: new Date().toISOString(),
      source: 'prompt',
      sourceImage: null,
    };
    const next = [record, ...savedPalettes].slice(0, 24);
    setSavedPalettes(next);
    persistPalettes(next);
    setPaletteSaveMessage('Palette saved to My Palettes.');
  };

  const handleCopyPaletteHexes = async (palette: PredefinedPalette) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(palette.colors.join(', '));
      setPaletteSaveMessage('Palette hex codes copied.');
    } catch (error) {
      console.warn('Failed to copy palette hex values', error);
    }
  };

  const handleDeletePalette = (id: string) => {
    const next = savedPalettes.filter((palette) => palette.id !== id);
    setSavedPalettes(next);
    persistPalettes(next);
  };

  const handleUseSavedPalette = (palette: PaletteRecord) => {
    const fallbackPreview =
      palette.sourceImage ??
      (palette.source === 'design'
        ? paletteTargetDesign ?? selectedImage ?? generatedImages[0] ?? null
        : palettePreviewImage);

    applyPaletteState(palette.colors, palette.source, fallbackPreview ?? null);

    if (palette.source === 'design') {
      setPaletteTargetDesign(fallbackPreview ?? null);
    }
    if (palette.source === 'upload') {
      setPaletteImagePreview(palette.sourceImage ?? null);
      setPaletteTargetDesign(null);
    }
  };
  
  const handleSketchUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSketchUrl(url);
      setSketchFile(file);
      setDesignFromSketchUrl(null); // Clear previous result
    }
  };
  
  const handleSketchRegenerate = async () => {
    if (!sketchFile || !sketchPrompt.trim()) {
      alert('Please upload a sketch and provide a prompt first.');
      return;
    }

    setIsGeneratingSketch(true);
    setDesignFromSketchUrl(null);

    try {
      // Determine strength based on sketch mode
      const strengthMap = {
        'line': 0.7,      // More transformation for line sketches
        'color': 0.5,     // Medium transformation for colored sketches
        'enhanced': 0.3   // Less transformation for detailed sketches
      };
      
      const strength = strengthMap[sketchMode];

      // Create FormData
      const formData = new FormData();
      formData.append('sketch', sketchFile);
      formData.append('prompt', sketchPrompt);
      formData.append('strength', strength.toString());

      // Submit sketch-to-design job
      const apiResponse = await fetch(`${API_URL}/api/ai/sketch-to-design`, {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${apiResponse.status}`);
      }

      const jobData = await apiResponse.json();
      
      if (!jobData.job_id) {
        throw new Error('No job ID received from server');
      }

      console.log('Sketch-to-design job started:', jobData.job_id);

      // Poll for job completion
      const pollInterval = 2000;
      const maxAttempts = 150;
      let attempts = 0;

      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          throw new Error('Sketch-to-design timed out. Please try again.');
        }

        attempts++;

        const statusResponse = await fetch(
          `${API_URL}/api/ai/generate/status/${jobData.job_id}`
        );

        if (!statusResponse.ok) {
          throw new Error('Failed to check sketch-to-design status');
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          const imageUrl = statusData.result.image_url.startsWith('http') 
            ? statusData.result.image_url 
            : `${API_URL}${statusData.result.image_url}`;
          setDesignFromSketchUrl(imageUrl);
          console.log('Sketch-to-design completed:', statusData.result.image_url);
          return; // Exit polling loop
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Sketch-to-design failed');
        } else {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          await poll();
        }
      };

      await poll();

    } catch (error) {
      console.error('Sketch to design error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate design from sketch.';
      alert(`Error: ${errorMessage}\n\nPlease ensure:\n1. Backend server is running on port 5000\n2. Python AI service is running on port 8000\n3. Check console for more details`);
    } finally {
      setIsGeneratingSketch(false);
    }
  };
  
  const handleAddColorPaletteFromSketch = () => {
    setActiveFeature('palette');
    generateRandomPalette(6);
  };

  const restyleFileInputRef = useRef<HTMLInputElement>(null);

  const handleRestyleUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRestyleUploadedImage(url);
      setRestyleUploadedFile(file);
      setRestyleSource(url);
      setRestyleError(null);
    }
  };

  const handleApplyRestyle = async () => {
    if (!restyleSource) return;
    
    setIsRestyling(true);
    setRestyleError(null);
    setRestyledUrl(null);

    try {
      // Prepare the image file
      let imageFile: File | null = null;

      if (restyleUploadedFile) {
        // Use the uploaded file directly
        imageFile = restyleUploadedFile;
      } else {
        // Fetch the image from URL and convert to File
        const response = await fetch(restyleSource);
        const blob = await response.blob();
        imageFile = new File([blob], 'design.jpg', { type: 'image/jpeg' });
      }

      // Create FormData
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', restylePrompt?.trim() || 'fashion restyle');
      formData.append('strength', (variation / 100).toString());

      // Submit restyle job
      const apiResponse = await fetch(`${API_URL}/api/ai/restyle`, {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || 'Failed to start restyle');
      }

      const jobData = await apiResponse.json();
      
      if (!jobData.job_id) {
        throw new Error('No job ID received from server');
      }

      console.log('Restyle job started:', jobData.job_id);

      // Poll for job completion
      const pollInterval = 2000;
      const maxAttempts = 150;
      let attempts = 0;

      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          throw new Error('Restyle timed out. Please try again.');
        }

        attempts++;

        const statusResponse = await fetch(
          `${API_URL}/api/ai/generate/status/${jobData.job_id}`,
          {
            credentials: 'include',
          }
        );

        if (!statusResponse.ok) {
          throw new Error('Failed to check restyle status');
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          const imageUrl = statusData.result.image_url.startsWith('http') 
            ? statusData.result.image_url 
            : `${API_URL}${statusData.result.image_url}`;
          setRestyledUrl(imageUrl);

          // Track restyle search for analytics
          trackSearch({
            searchType: 'restyle',
            restylePrompt: restylePrompt?.trim() || 'fashion restyle',
          });

          console.log('Restyle completed:', statusData.result.image_url);
          return; // Exit polling loop
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Restyle failed');
        } else {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          await poll();
        }
      };

      await poll();

    } catch (error: any) {
      console.error('Restyle error:', error);
      setRestyleError(error.message || 'Failed to restyle image. Please try again.');
    } finally {
      setIsRestyling(false);
    }
  };

  const features = [
    {
      section: 'Create',
      items: [
        { id: 'prompt', label: 'Prompt-based Design', Icon: Palette },
        { id: 'sketch', label: 'Sketch to Design', Icon: PenTool },
        { id: 'palette', label: 'Color Palette Studio', Icon: Palette },
        { id: 'restyle', label: 'AI Restyle', Icon: Wand2 },
      ],
    },
    {
      section: 'Enhance',
      items: [
        { id: 'similarity', label: 'AI Similarity Search', Icon: Search },
        { id: 'outfitmatch', label: 'Outfit Matching', Icon: Shirt },
        { id: 'occasion', label: 'Smart Occasion Styling', Icon: Sparkles },
      ],
    },
    {
      section: 'Explore',
      items: [
        { id: 'trends', label: 'Trend Dashboard', Icon: BarChart3 },
        { id: 'tryon', label: 'Virtual Try-On', Icon: Shirt },
      ],
    },
    {
      section: 'Manage',
      items: [
        { id: 'mydesigns', label: 'My Designs', Icon: Folder },
        { id: 'profile', label: 'Profile & Settings', Icon: UserIcon },
        { id: 'tags', label: 'Tags / Collections', Icon: Tags },
        { id: 'export', label: 'Export Center', Icon: Share2 },
      ],
    },
  ] as const;

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ designs: [], palettes: [], features: [] });
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    
    // Search designs
    const allDesigns = [...generatedImages, ...savedDesigns.filter((image) => !generatedImages.includes(image))];
    const matchedDesigns = allDesigns.filter(() => {
      // Match based on design properties or metadata if available
      // For now, just return all designs when searching
      return true;
    });

    // Search palettes
    const matchedPalettes = savedPalettes.filter((palette) => {
      return (
        palette.name.toLowerCase().includes(query) ||
        palette.notes?.toLowerCase().includes(query) ||
        palette.colors.some((color) => color.toLowerCase().includes(query))
      );
    });

    // Search features
    const allFeatures: Array<{ id: FeatureId; label: string }> = features.flatMap((section) =>
      section.items.map((item) => ({ id: item.id, label: item.label }))
    );
    const matchedFeatures = allFeatures
      .filter((feature) => feature.label.toLowerCase().includes(query))
      .map((feature) => feature.id);

    setSearchResults({
      designs: matchedDesigns,
      palettes: matchedPalettes,
      features: matchedFeatures,
    });

    // Auto-switch to the first matching feature if exists
    if (matchedFeatures.length > 0 && !matchedDesigns.length && !matchedPalettes.length) {
      setActiveFeature(matchedFeatures[0]);
    }
  }, [searchQuery, generatedImages, savedDesigns, savedPalettes]);

  const paletteDesignOptions = [
    ...generatedImages,
    ...savedDesigns.filter((image) => !generatedImages.includes(image)),
  ];

  const filteredPaletteLibrary = curatedPaletteLibrary.filter((palette) => {
    const moodMatch = paletteMoodFilter === 'All' || palette.tags.mood === paletteMoodFilter;
    const seasonMatch =
      paletteSeasonFilter === 'All' || palette.tags.season === paletteSeasonFilter;
    const styleMatch = paletteStyleFilter === 'All' || palette.tags.style === paletteStyleFilter;
    return moodMatch && seasonMatch && styleMatch;
  });

  if (!isAuthenticated) {
    return (
      <section id="ai-studio" className="py-24 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-12"
          >
            <Sparkles className="w-16 h-16 text-rose-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Design Studio</h2>
            <p className="text-xl text-gray-600 mb-8">
              Sign up to unlock the power of AI-generated fashion designs
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAuthRequired}
              className="px-8 py-4 bg-rose-600 text-white rounded-full font-semibold text-lg hover:bg-rose-700 transition-colors"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="ai-studio" className="py-24 bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Full-width studio container to push sidebars to extreme edges */}
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar */}
          <div className="mb-8">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 relative z-30">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left: Logo + Title */}
              <button
                onClick={handleNewDesign}
                className="flex items-center gap-3 group"
                title="Return to studio home"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white grid place-items-center shadow-md group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">AI Design Studio</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Create, manage, and export designs</div>
                </div>
              </button>

              {/* Center: Search */}
              <div className="flex-1 md:max-w-xl relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search designs, palettes, or projects"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                    >
                      {searchResults.features.length === 0 && 
                       searchResults.palettes.length === 0 && 
                       searchResults.designs.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No results found for "{searchQuery}"
                        </div>
                      ) : (
                        <div className="p-2">
                          {/* Features */}
                          {searchResults.features.length > 0 && (
                            <div className="mb-2">
                              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Features
                              </div>
                              {searchResults.features.map((featureId) => {
                                let feature: { id: FeatureId; label: string; Icon: any } | undefined;
                                for (const section of features) {
                                  const found = section.items.find((item: any) => item.id === featureId);
                                  if (found) {
                                    feature = found as any;
                                    break;
                                  }
                                }
                                if (!feature) return null;
                                const Icon = feature.Icon;
                                return (
                                  <button
                                    key={featureId}
                                    onClick={() => {
                                      setActiveFeature(featureId);
                                      setSearchQuery('');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <Icon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {feature.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Palettes */}
                          {searchResults.palettes.length > 0 && (
                            <div className="mb-2">
                              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Palettes ({searchResults.palettes.length})
                              </div>
                              {searchResults.palettes.slice(0, 5).map((palette) => (
                                <button
                                  key={palette.id}
                                  onClick={() => {
                                    setActiveFeature('palette');
                                    setSearchQuery('');
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex gap-1">
                                    {palette.colors.slice(0, 4).map((color, idx) => (
                                      <div
                                        key={idx}
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {palette.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Designs */}
                          {searchResults.designs.length > 0 && (
                            <div>
                              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Designs ({searchResults.designs.length})
                              </div>
                              <button
                                onClick={() => {
                                  setActiveFeature('mydesigns');
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Folder className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  View all designs in My Designs
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Quick Actions + User */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewDesign}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> New Design
                </button>
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" /> Upload
                </button>
                <button
                  onClick={() => setActiveFeature('mydesigns')}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <BookOpen className="w-4 h-4" /> My Library
                </button>

                {/* Export/Share dropdown */}
                <div id="studio-export-menu" className="relative z-30">
                  <button
                    onClick={() => setIsExportOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <Share2 className="w-4 h-4" /> Export / Share <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {isExportOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        <button onClick={() => handleExport('png')} className="w-full px-4 py-2.5 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> PNG
                        </button>
                        <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2.5 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" /> PDF
                        </button>
                        <button onClick={() => handleExport('link')} className="w-full px-4 py-2.5 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Share Link
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dark mode toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="ml-2 w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-rose-500 transition"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>

                {/* User avatar menu */}
                <div id="studio-user-menu" className="relative z-30">
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="ml-1 w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center hover:ring-2 hover:ring-rose-500 transition"
                    aria-label="User menu"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b dark:border-gray-700">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                        </div>
                        <button 
                          onClick={() => setActiveFeature('profile')}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Settings
                        </button>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          {isDarkMode ? (
                            <>
                              <Sun className="w-4 h-4 text-yellow-500" /> Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Dark Mode
                            </>
                          )}
                        </button>
                        <button
                          onClick={logout}
                          className="w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* hidden upload input */}
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              onChange={handleUploadChange}
              className="hidden"
            />
          </div>
        </div>
        {/* Sidebar + Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Feature Navigation Hub */}
          <aside className="lg:col-span-3 order-1">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 sticky top-24">
              {features.map((group) => (
                <div key={group.section} className="mb-4 last:mb-0">
                  <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {group.section}
                  </div>
                  <div className="space-y-2">
                    {group.items.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveFeature(id as FeatureId)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                          activeFeature === id
                            ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 shadow-sm'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                        title={label}
                      >
                        <Icon className={`w-5 h-5 ${activeFeature === id ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content (expanded) */}
          <div className="lg:col-span-9 lg:col-start-4 order-2 min-w-0">
            {activeFeature !== 'prompt' ? (
              <>
                {activeFeature === 'palette' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">Color Palette Studio</h3>
                          <p className="text-purple-100">Extract, generate, and manage stunning color palettes for your designs</p>
                        </div>
                        <Palette className="w-16 h-16 opacity-50" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-8">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Extract from AI Design</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Choose a generated look to capture its dominant hues.
                              </p>
                            </div>
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                              <ImagePlus className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                          </div>
                          <div className="relative group">
                            <select
                              value={paletteTargetDesign ?? ''}
                              onChange={(event) => setPaletteTargetDesign(event.target.value || null)}
                              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-3.5 pr-10 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-lg cursor-pointer appearance-none font-medium group-hover:scale-[1.01]"
                              style={{ backgroundImage: 'none' }}
                            >
                              <option value="" className="bg-white dark:bg-gray-800">✨ Select generated design</option>
                              {paletteDesignOptions.map((image, index) => (
                                <option value={image} key={`${image}-${index}`} className="bg-white dark:bg-gray-800">{`🎨 Design ${index + 1}`}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 pointer-events-none transition-transform duration-300 group-hover:translate-y-[-45%]" />
                          </div>
                          <button
                            onClick={handleDesignPaletteExtraction}
                            disabled={!paletteTargetDesign || isPaletteLoading}
                            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPaletteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Extract Colors
                          </button>
                          {paletteTargetDesign && (
                            <div className="mt-4 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
                              <img
                                src={paletteTargetDesign}
                                alt="Selected design for palette extraction"
                                className="h-40 w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Extract from Upload</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Upload an inspiration image to auto-extract up to six colors.
                              </p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-all hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10">
                            <span>Click to upload or drag an image</span>
                            <input type="file" accept="image/*" onChange={handlePaletteUpload} className="hidden" />
                          </label>
                          <button
                            onClick={handleUploadPaletteExtraction}
                            disabled={!paletteUploadObjectUrl || isPaletteLoading}
                            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPaletteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Extract Colors
                          </button>
                          {paletteImagePreview && (
                            <div className="mt-4 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
                              <img
                                src={paletteImagePreview}
                                alt="Uploaded palette reference"
                                className="h-40 w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Generate from Prompt</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Describe the mood or theme and we will suggest a palette.
                              </p>
                            </div>
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                          </div>
                          <textarea
                            value={palettePrompt}
                            onChange={(event) => setPalettePrompt(event.target.value)}
                            placeholder="e.g., neon streetwear at midnight"
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={handleGeneratePaletteFromPrompt}
                              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                              <Wand2 className="h-4 w-4" />
                              Generate Palette
                            </button>
                            <button
                              onClick={() => {
                                setPalettePrompt('');
                                setPaletteKeywordMatches([]);
                                setPaletteKeywordQuery('');
                                generateRandomPalette(6);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                              <RefreshCcw className="h-4 w-4" />
                              Surprise Me
                            </button>
                          </div>
                        </div>
                      </div>
                      {paletteError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {paletteError}
                        </div>
                      )}
                      {paletteKeywordMatches.length > 0 && (
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                Keyword Matches for "{paletteKeywordQuery}"
                              </h4>
                              <p className="text-xs text-gray-500">
                                Select a curated palette that aligns with your search.
                              </p>
                            </div>
                            <span className="text-xs uppercase tracking-wide text-gray-400">
                              {paletteKeywordMatches.length} suggestions
                            </span>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            {paletteKeywordMatches.map((palette) => (
                              <div
                                key={`keyword-${palette.id}`}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                              >
                                <div className="flex h-14 w-full overflow-hidden">
                                  {palette.colors.map((color, index) => (
                                    <div
                                      key={`${palette.id}-keyword-${color}-${index}`}
                                      className="flex-1"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                                <div className="p-4 space-y-1">
                                  <div className="text-sm font-semibold text-gray-900">{palette.name}</div>
                                  <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-wide text-gray-500">
                                    <span>{palette.tags.mood}</span>
                                    <span>{palette.tags.season}</span>
                                    <span>{palette.tags.style}</span>
                                  </div>
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                  <div className="p-4 space-y-2">
                                    <button
                                      type="button"
                                      onClick={() => handleApplyPredefinedPalette(palette)}
                                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-white"
                                    >
                                      <Palette className="h-3.5 w-3.5" />
                                      Apply Palette
                                    </button>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSavePaletteFromLibrary(palette)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur transition hover:bg-white"
                                      >
                                        <SaveIcon className="h-3.5 w-3.5" />
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPaletteHexes(palette)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur transition hover:bg-white"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Palette Swatches</h4>
                            <p className="text-xs text-gray-500">
                              Tap a swatch to bias prompts. Copy hex codes or apply the palette to enrich your current design brief.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{paletteColors.length} colors</span>
                            {isPaletteLoading && <Loader2 className="h-4 w-4 animate-spin text-rose-500" />}
                          </div>
                        </div>
                        {paletteColors.length > 0 ? (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {paletteColors.map((hex) => (
                              <div
                                key={hex}
                                className={`group rounded-xl border ${selectedColor === hex ? 'border-rose-500 shadow-lg' : 'border-transparent shadow'} overflow-hidden`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleApplyColorToDesign(hex)}
                                  className="h-20 w-full transition-transform group-hover:scale-[1.02]"
                                  style={{ backgroundColor: hex }}
                                  aria-label={`Use ${hex}`}
                                />
                                <div className="flex items-center justify-between bg-white px-2 py-1.5 text-xs font-mono text-gray-700">
                                  <span>{hex}</span>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleCopyHex(hex);
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                                    title="Copy hex code"
                                  >
                                    {copiedHex === hex ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                            Generate or extract a palette to see colors here.
                          </div>
                        )}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <input
                            value={paletteName}
                            onChange={(event) => setPaletteName(event.target.value)}
                            placeholder="Name this palette (optional)"
                            className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                          <button
                            onClick={handleApplyPaletteToDesign}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                          >
                            <Palette className="h-4 w-4" />
                            Apply Palette
                          </button>
                          <button
                            onClick={handleSendPaletteToPromptDesigner}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            <ArrowRight className="h-4 w-4" />
                            Send to Prompt Designer
                          </button>
                          <button
                            onClick={handleSaveCurrentPalette}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            <SaveIcon className="h-4 w-4" />
                            Save Palette
                          </button>
                          {selectedColor && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                              <span
                                className="h-3.5 w-3.5 rounded-full"
                                style={{ backgroundColor: selectedColor }}
                              />
                              {selectedColor}
                            </span>
                          )}
                          {paletteSaveMessage && (
                            <span className="text-sm font-medium text-emerald-600">{paletteSaveMessage}</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Palette Library</h4>
                            <p className="text-xs text-gray-500">Curated fashion-ready palettes organized by mood, season, and style.</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={paletteMoodFilter}
                              onChange={(event) => setPaletteMoodFilter(event.target.value as PaletteMood | 'All')}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              aria-label="Filter palettes by mood"
                            >
                              {paletteMoodFilters.map((option) => (
                                <option key={`mood-${option}`} value={option}>
                                  {option === 'All' ? 'All moods' : option}
                                </option>
                              ))}
                            </select>
                            <select
                              value={paletteSeasonFilter}
                              onChange={(event) =>
                                setPaletteSeasonFilter(event.target.value as PaletteSeason | 'All')
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              aria-label="Filter palettes by season"
                            >
                              {paletteSeasonFilters.map((option) => (
                                <option key={`season-${option}`} value={option}>
                                  {option === 'All' ? 'All seasons' : option}
                                </option>
                              ))}
                            </select>
                            <select
                              value={paletteStyleFilter}
                              onChange={(event) =>
                                setPaletteStyleFilter(event.target.value as PaletteStyle | 'All')
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              aria-label="Filter palettes by style"
                            >
                              {paletteStyleFilters.map((option) => (
                                <option key={`style-${option}`} value={option}>
                                  {option === 'All' ? 'All styles' : option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {filteredPaletteLibrary.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                            No palettes match the selected filters. Adjust the categories to discover more looks.
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {filteredPaletteLibrary.map((palette) => (
                              <div
                                key={palette.id}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                              >
                                <div className="flex h-16 w-full overflow-hidden">
                                  {palette.colors.map((color, index) => (
                                    <div
                                      key={`${palette.id}-${color}-${index}`}
                                      className="flex-1"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                                <div className="p-4 space-y-1">
                                  <div className="text-sm font-semibold text-gray-900">{palette.name}</div>
                                  <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-wide text-gray-500">
                                    <span>{palette.tags.mood}</span>
                                    <span>{palette.tags.season}</span>
                                    <span>{palette.tags.style}</span>
                                  </div>
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                  <div className="p-4 space-y-2">
                                    <button
                                      type="button"
                                      onClick={() => handleApplyPredefinedPalette(palette)}
                                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-white"
                                    >
                                      <Palette className="h-3.5 w-3.5" />
                                      Apply Palette
                                    </button>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSavePaletteFromLibrary(palette)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur transition hover:bg-white"
                                      >
                                        <SaveIcon className="h-3.5 w-3.5" />
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPaletteHexes(palette)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur transition hover:bg-white"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">My Palettes</h4>
                          {savedPalettes.length > 0 && (
                            <span className="text-xs text-gray-500">{savedPalettes.length} saved</span>
                          )}
                        </div>
                        {savedPalettes.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                            Saved palettes will appear here. Capture palettes to reuse across projects.
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {savedPalettes.map((palette) => (
                              <div key={palette.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">{palette.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(palette.createdAt).toLocaleDateString()} •{' '}
                                      {palette.source === 'design'
                                        ? 'AI design'
                                        : palette.source === 'upload'
                                        ? 'Upload'
                                        : 'Prompt'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleUseSavedPalette(palette)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                      <Palette className="h-3.5 w-3.5" />
                                      Use
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePalette(palette.id)}
                                      className="inline-flex items-center justify-center rounded-lg border border-transparent bg-rose-50 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100"
                                      title="Delete palette"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  {palette.colors.map((color) => (
                                    <span
                                      key={`${palette.id}-${color}`}
                                      className="flex-1 h-8 rounded-lg"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  </motion.div>
                )}

                {activeFeature === 'sketch' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">Sketch-to-Design Converter</h3>
                          <p className="text-rose-100">Transform your fashion sketches into professional AI-powered designs</p>
                        </div>
                        <ImagePlus className="w-16 h-16 opacity-50" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                    {!sketchUrl ? (
                      <label className="block border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 text-center cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:shadow-xl">
                        <input type="file" accept="image/*" className="hidden" onChange={handleSketchUpload} />
                        <div className="bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Upload className="w-10 h-10 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Drag & drop your sketch or click to upload</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Supports PNG, JPG, JPEG up to 10MB</div>
                      </label>
                    ) : (
                      <div className="space-y-6">
                        {/* Prompt Input */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Design Prompt</label>
                          <input 
                            value={sketchPrompt} 
                            onChange={(e) => setSketchPrompt(e.target.value)}
                            placeholder="Describe the fashion design you want..."
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 w-full mb-1">Quick examples:</p>
                            <button 
                              onClick={() => setSketchPrompt('Elegant evening gown, luxurious fabric, professional fashion photography, high quality')}
                              className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Evening Gown
                            </button>
                            <button 
                              onClick={() => setSketchPrompt('Modern streetwear outfit, urban style, photorealistic, studio lighting')}
                              className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Streetwear
                            </button>
                            <button 
                              onClick={() => setSketchPrompt('Professional business suit, formal attire, high quality fashion photography')}
                              className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Business Suit
                            </button>
                            <button 
                              onClick={() => setSketchPrompt('Casual summer dress, flowing fabric, bright colors, fashion photography')}
                              className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Summer Dress
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-800 dark:text-gray-200">Original sketch</div>
                              <button
                                onClick={() => {
                                  setSketchUrl(null);
                                  setSketchFile(null);
                                  setDesignFromSketchUrl(null);
                                }}
                                className="text-sm text-rose-600 dark:text-rose-400 hover:underline"
                              >
                                Upload new
                              </button>
                            </div>
                            <img src={sketchUrl} alt="Sketch" className="w-full rounded-xl border dark:border-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-800 dark:text-gray-200">Generated design</div>
                              <div className="flex items-center gap-2 text-sm">
                                {(['line','color','enhanced'] as const).map((m) => (
                                  <button 
                                    key={m} 
                                    onClick={() => setSketchMode(m)} 
                                    className={`px-3 py-1.5 rounded-lg border capitalize ${sketchMode===m ? 'bg-gray-900 dark:bg-gray-700 text-white border-gray-900 dark:border-gray-700' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                                    title={m === 'line' ? 'For simple line sketches' : m === 'color' ? 'For colored sketches' : 'For detailed sketches'}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {isGeneratingSketch ? (
                              <div className="h-80 grid place-items-center rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                                <div className="text-center">
                                  <Loader2 className="w-12 h-12 text-rose-600 dark:text-rose-400 animate-spin mx-auto mb-3" />
                                  <div className="text-gray-600 dark:text-gray-400">Generating design from sketch...</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take 30-60 seconds</div>
                                </div>
                              </div>
                            ) : designFromSketchUrl ? (
                              <div className="relative group">
                                <img src={designFromSketchUrl} alt="Design" className="w-full rounded-xl border dark:border-gray-600" />
                                <button
                                  onClick={() => handleSaveToWishlist(designFromSketchUrl)}
                                  className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 ${
                                    savedDesigns.includes(designFromSketchUrl)
                                      ? 'bg-rose-600 text-white shadow-lg scale-110'
                                      : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:scale-110 shadow-md backdrop-blur-sm'
                                  } opacity-0 group-hover:opacity-100`}
                                  title={savedDesigns.includes(designFromSketchUrl) ? 'Saved to My Designs' : 'Save to My Designs'}
                                >
                                  <Heart
                                    className={`w-5 h-5 transition-all ${
                                      savedDesigns.includes(designFromSketchUrl) ? 'fill-current' : ''
                                    }`}
                                  />
                                </button>
                              </div>
                            ) : (
                              <div className="h-80 grid place-items-center rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                                Click "Generate Design" to create
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={handleSketchRegenerate} 
                            disabled={isGeneratingSketch}
                            className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                          >
                            {isGeneratingSketch ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Generate Design
                              </>
                            )}
                          </button>
                          {designFromSketchUrl && (
                            <>
                              <button 
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = designFromSketchUrl;
                                  link.download = 'sketch-design.jpg';
                                  link.click();
                                }}
                                className="px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              <button 
                                onClick={handleAddColorPaletteFromSketch} 
                                className="px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                              >
                                <Palette className="w-4 h-4" />
                                Extract Palette
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.div>
                )}

                {activeFeature === 'restyle' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">AI Restyle Editor</h3>
                          <p className="text-purple-100">Transform existing designs with AI-powered style variations</p>
                        </div>
                        <Wand2 className="w-16 h-16 opacity-50" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose existing design</label>
                          <div className="flex gap-2">
                            <select
                              value={restyleUploadedImage ? 'uploaded' : (restyleSource ?? '')}
                              onChange={(e) => {
                                if (e.target.value === 'uploaded') {
                                  // Keep the uploaded image
                                  return;
                                }
                                setRestyleUploadedImage(null);
                                setRestyleSource(e.target.value || null);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Select from generated/saved</option>
                              {restyleUploadedImage && <option value="uploaded">Uploaded Image</option>}
                              {[...savedDesigns, ...generatedImages].map((img, i) => (
                                <option value={img} key={`${img}-${i}`}>{`Design #${i + 1}`}</option>
                              ))}
                            </select>
                            <input
                              type="file"
                              accept="image/*"
                              ref={restyleFileInputRef}
                              onChange={handleRestyleUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => restyleFileInputRef.current?.click()}
                              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                              title="Upload image from device"
                            >
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload</span>
                            </button>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Restyle prompt</label>
                          <input value={restylePrompt} onChange={(e) => setRestylePrompt(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick fill examples:</div>
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => setRestylePrompt('Convert to elegant vintage evening wear with luxurious fabrics')}
                                className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                              >
                                Vintage Evening
                              </button>
                              <button 
                                onClick={() => setRestylePrompt('Transform into modern streetwear with bold graphics and urban style')}
                                className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                              >
                                Modern Streetwear
                              </button>
                              <button 
                                onClick={() => setRestylePrompt('Redesign as professional formal business attire')}
                                className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                              >
                                Formal Business
                              </button>
                              <button 
                                onClick={() => setRestylePrompt('Convert to bohemian casual style with flowing fabrics')}
                                className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                              >
                                Boho Casual
                              </button>
                              <button 
                                onClick={() => setRestylePrompt('Transform into luxury haute couture fashion')}
                                className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                              >
                                Haute Couture
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <button 
                          onClick={handleApplyRestyle} 
                          disabled={!restyleSource || isRestyling} 
                          className="px-4 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-lg hover:bg-rose-700 dark:hover:bg-rose-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isRestyling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Restyling...
                            </>
                          ) : (
                            'Apply Restyle'
                          )}
                        </button>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700 dark:text-gray-300">Strength</label>
                          <input 
                            type="range" 
                            min={0} 
                            max={100} 
                            value={variation} 
                            onChange={(e) => setVariation(parseInt(e.target.value))} 
                            disabled={isRestyling}
                            className="accent-rose-600" 
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{variation}%</span>
                        </div>
                      </div>
                      {restyleError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                          {restyleError}
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">Original</div>
                          {restyleSource ? (
                            <img src={restyleSource} alt="Original design" className="w-full rounded-xl border dark:border-gray-600" />
                          ) : (
                            <div className="h-72 grid place-items-center rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">Choose a design to restyle</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">Restyled output</div>
                          {isRestyling ? (
                            <div className="h-72 grid place-items-center rounded-xl border dark:border-gray-600 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20">
                              <div className="text-center">
                                <Loader2 className="w-12 h-12 animate-spin text-rose-600 dark:text-rose-400 mx-auto mb-3" />
                                <p className="text-gray-700 dark:text-gray-300 font-medium">Generating restyled design...</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take a few minutes</p>
                              </div>
                            </div>
                          ) : restyledUrl ? (
                            <div className="relative group">
                              <img src={restyledUrl} alt="Restyled output" className="w-full rounded-xl border dark:border-gray-600" />
                              <button
                                onClick={() => handleSaveToWishlist(restyledUrl)}
                                className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 ${
                                  savedDesigns.includes(restyledUrl)
                                    ? 'bg-rose-600 text-white shadow-lg scale-110'
                                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:scale-110 shadow-md backdrop-blur-sm'
                                } opacity-0 group-hover:opacity-100`}
                                title={savedDesigns.includes(restyledUrl) ? 'Saved to My Designs' : 'Save to My Designs'}
                              >
                                <Heart
                                  className={`w-5 h-5 transition-all ${
                                    savedDesigns.includes(restyledUrl) ? 'fill-current' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          ) : (
                            <div className="h-72 grid place-items-center rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">Run restyle to view result</div>
                          )}
                        </div>
                      </div>
                    </div>
                    </div>
                  </motion.div>
                )}

                {activeFeature === 'similarity' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">Similarity Search</h3>
                          <p className="text-indigo-100">Find designs similar to what you love using AI visual search</p>
                        </div>
                        <Search className="w-16 h-16 opacity-50" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">

                    {/* Mode Toggle */}
                    <div className="flex gap-3 mb-8 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl w-fit">
                      <button
                        onClick={() => setSimilaritySearchMode('text')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${similaritySearchMode === 'text' ? 'bg-white dark:bg-gray-600 text-rose-600 dark:text-rose-400 shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                      >
                        Text-based Search
                      </button>
                      <button
                        onClick={() => setSimilaritySearchMode('image')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${similaritySearchMode === 'image' ? 'bg-white dark:bg-gray-600 text-rose-600 dark:text-rose-400 shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                      >
                        Image-based Search
                      </button>
                    </div>

                    {/* Text-based Search */}
                    {similaritySearchMode === 'text' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Category */}
                          <div>
                            <label className="block text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-3">👕 Category</label>
                            <div className="relative group">
                              <select
                                value={similarityCategory}
                                onChange={(e) => setSimilarityCategory(e.target.value)}
                                className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-white via-rose-50/30 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-400 transition-all duration-300 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-xl cursor-pointer appearance-none shadow-md font-medium group-hover:scale-[1.01]"
                                style={{ backgroundImage: 'none' }}
                              >
                                <option value="" className="bg-white dark:bg-gray-800 text-gray-400">✨ Select Category</option>
                                <optgroup label="👔 Topwear" className="font-semibold bg-rose-50 dark:bg-gray-800">
                                  <option value="t-shirt" className="bg-white dark:bg-gray-800">👕 T-Shirts</option>
                                  <option value="shirt" className="bg-white dark:bg-gray-800">👔 Shirts</option>
                                  <option value="top" className="bg-white dark:bg-gray-800">👚 Tops</option>
                                  <option value="blouse" className="bg-white dark:bg-gray-800">👚 Blouses</option>
                                  <option value="sweater" className="bg-white dark:bg-gray-800">🧥 Sweaters</option>
                                  <option value="hoodie" className="bg-white dark:bg-gray-800">🧥 Hoodies</option>
                                  <option value="jacket" className="bg-white dark:bg-gray-800">🧥 Jackets</option>
                                  <option value="coat" className="bg-white dark:bg-gray-800">🧥 Coats</option>
                                </optgroup>
                                <optgroup label="👖 Bottomwear" className="font-semibold bg-blue-50 dark:bg-gray-800">
                                  <option value="jeans" className="bg-white dark:bg-gray-800">👖 Jeans</option>
                                  <option value="trousers" className="bg-white dark:bg-gray-800">👖 Trousers</option>
                                  <option value="pants" className="bg-white dark:bg-gray-800">👖 Pants</option>
                                  <option value="shorts" className="bg-white dark:bg-gray-800">🩳 Shorts</option>
                                  <option value="skirt" className="bg-white dark:bg-gray-800">👗 Skirts</option>
                                  <option value="leggings" className="bg-white dark:bg-gray-800">🩲 Leggings</option>
                                </optgroup>
                                <optgroup label="👗 One-Piece / Full Outfit" className="font-semibold bg-purple-50 dark:bg-gray-800">
                                  <option value="dress" className="bg-white dark:bg-gray-800">👗 Dresses</option>
                                  <option value="gown" className="bg-white dark:bg-gray-800">👰 Gowns</option>
                                  <option value="jumpsuit" className="bg-white dark:bg-gray-800">🥼 Jumpsuits</option>
                                  <option value="romper" className="bg-white dark:bg-gray-800">👶 Rompers</option>
                                </optgroup>
                                <optgroup label="👟 Footwear" className="font-semibold bg-green-50 dark:bg-gray-800">
                                  <option value="sneakers" className="bg-white dark:bg-gray-800">👟 Sneakers</option>
                                  <option value="formal-shoes" className="bg-white dark:bg-gray-800">👞 Formal Shoes</option>
                                  <option value="boots" className="bg-white dark:bg-gray-800">🥾 Boots</option>
                                  <option value="sandals" className="bg-white dark:bg-gray-800">🩴 Sandals</option>
                                  <option value="heels" className="bg-white dark:bg-gray-800">👠 Heels</option>
                                </optgroup>
                                <optgroup label="👜 Accessories" className="font-semibold bg-pink-50 dark:bg-gray-800">
                                  <option value="watches" className="bg-white dark:bg-gray-800">⌚ Watches</option>
                                  <option value="bags" className="bg-white dark:bg-gray-800">👜 Bags</option>
                                  <option value="belts" className="bg-white dark:bg-gray-800">👛 Belts</option>
                                  <option value="scarves" className="bg-white dark:bg-gray-800">🧣 Scarves</option>
                                  <option value="sunglasses" className="bg-white dark:bg-gray-800">🕶️ Sunglasses</option>
                                </optgroup>
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-rose-500 dark:text-rose-400 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-rose-600 dark:group-hover:text-rose-300" />
                              </div>
                            </div>
                          </div>

                          {/* Style */}
                          <div>
                            <label className="block text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">👗 Style</label>
                            <div className="relative group">
                              <select
                                value={similarityStyle}
                                onChange={(e) => setSimilarityStyle(e.target.value)}
                                className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-xl cursor-pointer appearance-none shadow-md font-medium group-hover:scale-[1.01]"
                                style={{ backgroundImage: 'none' }}
                              >
                                <option value="" className="bg-white dark:bg-gray-800 text-gray-400">✨ Select Style</option>
                                <option value="casual" className="bg-white dark:bg-gray-800">👕 Casual</option>
                                <option value="formal" className="bg-white dark:bg-gray-800">🎩 Formal</option>
                                <option value="party" className="bg-white dark:bg-gray-800">🎉 Party</option>
                                <option value="streetwear" className="bg-white dark:bg-gray-800">🏙️ Streetwear</option>
                                <option value="minimal" className="bg-white dark:bg-gray-800">⚪ Minimal</option>
                                <option value="traditional" className="bg-white dark:bg-gray-800">🏛️ Traditional</option>
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-purple-500 dark:text-purple-400 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-300" />
                              </div>
                            </div>
                          </div>

                          {/* Color */}
                          <div>
                            <label className="block text-sm font-semibold bg-gradient-to-r from-pink-600 to-orange-500 dark:from-pink-400 dark:to-orange-400 bg-clip-text text-transparent mb-3">🎨 Color</label>
                            <div className="relative group">
                              <select
                                value={similarityColor}
                                onChange={(e) => setSimilarityColor(e.target.value)}
                                className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-white via-pink-50/30 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300 hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-xl cursor-pointer appearance-none shadow-md font-medium group-hover:scale-[1.01]"
                                style={{ backgroundImage: 'none' }}
                              >
                                <option value="" className="bg-white dark:bg-gray-800 text-gray-400">✨ Select Color</option>
                                <option value="white" className="bg-white dark:bg-gray-800">⚪ White</option>
                                <option value="black" className="bg-white dark:bg-gray-800">⚫ Black</option>
                                <option value="blue" className="bg-white dark:bg-gray-800">🔵 Blue</option>
                                <option value="beige" className="bg-white dark:bg-gray-800">🟤 Beige</option>
                                <option value="brown" className="bg-white dark:bg-gray-800">🟫 Brown</option>
                                <option value="green" className="bg-white dark:bg-gray-800">🟢 Green</option>
                                <option value="red" className="bg-white dark:bg-gray-800">🔴 Red</option>
                                <option value="pastel" className="bg-white dark:bg-gray-800">🌸 Pastel</option>
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-pink-500 dark:text-pink-400 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-pink-600 dark:group-hover:text-pink-300" />
                              </div>
                            </div>
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">🧍 Gender</label>
                            <div className="relative group">
                              <select
                                value={similarityGender}
                                onChange={(e) => setSimilarityGender(e.target.value)}
                                className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl cursor-pointer appearance-none shadow-md font-medium group-hover:scale-[1.01]"
                                style={{ backgroundImage: 'none' }}
                              >
                                <option value="" className="bg-white dark:bg-gray-800 text-gray-400">✨ Select Gender</option>
                                <option value="men" className="bg-white dark:bg-gray-800">👨 Men</option>
                                <option value="women" className="bg-white dark:bg-gray-800">👩 Women</option>
                                <option value="unisex" className="bg-white dark:bg-gray-800">🧑 Unisex</option>
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-blue-500 dark:text-blue-400 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                              </div>
                            </div>
                          </div>

                          {/* Occasion */}
                          <div>
                            <label className="block text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-3">📅 Occasion</label>
                            <div className="relative group">
                              <select
                                value={similarityOccasion}
                                onChange={(e) => setSimilarityOccasion(e.target.value)}
                                className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-white via-emerald-50/30 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-xl cursor-pointer appearance-none shadow-md font-medium group-hover:scale-[1.01]"
                                style={{ backgroundImage: 'none' }}
                              >
                                <option value="" className="bg-white dark:bg-gray-800 text-gray-400">✨ Select Occasion</option>
                                <option value="daily" className="bg-white dark:bg-gray-800">☀️ Daily Wear</option>
                                <option value="office" className="bg-white dark:bg-gray-800">💼 Office Wear</option>
                                <option value="party" className="bg-white dark:bg-gray-800">🎊 Party Wear</option>
                                <option value="wedding" className="bg-white dark:bg-gray-800">💒 Wedding</option>
                                <option value="travel" className="bg-white dark:bg-gray-800">✈️ Travel</option>
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-emerald-500 dark:text-emerald-400 transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">💬 Additional Description (Optional)</label>
                          <textarea
                            value={similarityDescription}
                            onChange={(e) => setSimilarityDescription(e.target.value)}
                            placeholder="Add any additional details about what you're looking for..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                          />
                        </div>

                        {/* Search Button */}
                        <button
                          onClick={async () => {
                            setIsSimilaritySearching(true);
                            setSimilarityError(null);
                            setSimilarityResults([]);
                            
                            try {
                              // Build query from inputs
                              const queryParts = [];
                              if (similarityDescription) queryParts.push(similarityDescription);
                              if (similarityCategory) queryParts.push(similarityCategory);
                              if (similarityColor) queryParts.push(similarityColor);
                              if (similarityStyle) queryParts.push(similarityStyle);
                              if (similarityGender) queryParts.push(similarityGender);
                              if (similarityOccasion) queryParts.push(similarityOccasion);
                              
                              const query = queryParts.join(' ');
                              
                              if (!query.trim()) {
                                setSimilarityError('Please enter at least one search criterion');
                                setIsSimilaritySearching(false);
                                return;
                              }
                              
                              const response = await fetch(`${API_URL}/api/ai/similar-designs`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ query, topK: 20 })
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to get recommendations');
                              }
                              
                              const data = await response.json();
                              
                              // Process results from new API format
                              const results: any[] = [];
                              if (data.success && data.results) {
                                data.results.forEach((item: any, index: number) => {
                                  results.push({
                                    id: item.id || item.image,
                                    title: item.description || `${item.color || ''} ${item.sub_category || ''}`.trim(),
                                    image: `${API_URL}/api/ai/dataset/images/${item.image}`,
                                    category: item.main_category,
                                    color: item.color,
                                    style: item.style,
                                    gender: item.gender,
                                    occasion: item.occasion,
                                    match: Math.round(95 - (index * 2)) // Approximate match score
                                  });
                                });
                              }
                              
                              setSimilarityResults(results);
                              
                              if (results.length === 0) {
                                setSimilarityError('No recommendations found. Try different search terms.');
                              }
                            } catch (error) {
                              console.error('Recommendation error:', error);
                              setSimilarityError('Failed to get recommendations. Make sure the AI service is running.');
                            } finally {
                              setIsSimilaritySearching(false);
                            }
                          }}
                          disabled={isSimilaritySearching}
                          className="w-full py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                          {isSimilaritySearching ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <Search className="w-5 h-5" />
                              Search Recommendations
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Image-based Search */}
                    {similaritySearchMode === 'image' && (
                      <div className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center">
                          {similarityImagePreview ? (
                            <div className="space-y-4">
                              <img src={similarityImagePreview} alt="Upload preview" className="max-h-96 mx-auto rounded-xl shadow-lg" />
                              <div className="flex gap-3 justify-center">
                                <button
                                  onClick={() => {
                                    setSimilarityImageFile(null);
                                    setSimilarityImagePreview(null);
                                  }}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  Remove
                                </button>
                                <button
                                  onClick={() => similarityFileInputRef.current?.click()}
                                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                                >
                                  Change Image
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => similarityFileInputRef.current?.click()} className="cursor-pointer">
                              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload an image</h4>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">Click to browse or drag and drop</p>
                              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                            </div>
                          )}
                          <input
                            ref={similarityFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSimilarityImageFile(file);
                                setSimilarityImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            className="hidden"
                          />
                        </div>

                        <button
                          onClick={async () => {
                            if (!similarityImageFile) return;
                            setIsSimilaritySearching(true);
                            setSimilarityError(null);
                            setSimilarityResults([]);
                            
                            try {
                              const formData = new FormData();
                              formData.append('image', similarityImageFile);
                              formData.append('topK', '20');
                              
                              const response = await fetch(`${API_URL}/api/ai/similar-designs`, {
                                method: 'POST',
                                body: formData
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to get recommendations');
                              }
                              
                              const data = await response.json();
                              
                              // Process results from new API format
                              const results: any[] = [];
                              if (data.success && data.results) {
                                data.results.forEach((item: any, index: number) => {
                                  results.push({
                                    id: item.id || item.image,
                                    title: item.description || `${item.color || ''} ${item.sub_category || ''}`.trim(),
                                    image: `${API_URL}/api/ai/dataset/images/${item.image}`,
                                    category: item.main_category,
                                    color: item.color,
                                    style: item.style,
                                    gender: item.gender,
                                    occasion: item.occasion,
                                    match: Math.round(95 - (index * 2)) // Approximate match score
                                  });
                                });
                              }
                              
                              setSimilarityResults(results);
                              
                              if (results.length === 0) {
                                setSimilarityError('No similar items found. Try a different image.');
                              }
                            } catch (error) {
                              console.error('Image recommendation error:', error);
                              setSimilarityError('Failed to get recommendations. Make sure the AI service is running.');
                            } finally {
                              setIsSimilaritySearching(false);
                            }
                          }}
                          disabled={!similarityImageFile || isSimilaritySearching}
                          className="w-full py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                          {isSimilaritySearching ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <Search className="w-5 h-5" />
                              Find Similar Designs
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Error Message */}
                    {similarityError && (
                      <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-red-600 dark:text-red-400">{similarityError}</p>
                      </div>
                    )}

                    {/* Results */}
                    {similarityResults.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{similarityResults.length} results</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {similarityResults.map((result) => (
                            <div key={result.id} className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                              <div className="relative overflow-hidden aspect-square">
                                <img src={result.image} alt={result.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg">
                                  <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{result.match}% Match</span>
                                </div>
                              </div>
                              <div className="p-4">
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{result.title}</h5>
                                <div className="flex gap-2">
                                  <button className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium">
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleSaveToWishlist(result.image)}
                                    className={`p-2 rounded-lg transition-all ${
                                      savedDesigns.includes(result.image)
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                    title={savedDesigns.includes(result.image) ? 'Saved to My Designs' : 'Save to My Designs'}
                                  >
                                    <Heart className={`w-4 h-4 ${
                                      savedDesigns.includes(result.image)
                                        ? 'fill-current'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.div>
                )}

                {activeFeature === 'outfitmatch' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">AI Outfit Matcher</h3>
                          <p className="text-pink-100">Upload any fashion item and get complete coordinated outfit suggestions</p>
                        </div>
                        <Shirt className="w-16 h-16 opacity-50" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">

                    {/* Upload Section */}
                    <div className="space-y-6 mb-8">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center">
                          {outfitMatchImagePreview ? (
                            <div className="space-y-4">
                              <img src={outfitMatchImagePreview} alt="Upload preview" className="max-h-96 mx-auto rounded-xl shadow-lg" />
                              <div className="flex gap-3 justify-center">
                                <button
                                  onClick={() => {
                                    setOutfitMatchImageFile(null);
                                    setOutfitMatchImagePreview(null);
                                    setOutfitMatchResults({});
                                  }}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  Remove
                                </button>
                                <button
                                  onClick={() => outfitMatchFileInputRef.current?.click()}
                                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                                >
                                  Change Image
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => outfitMatchFileInputRef.current?.click()} className="cursor-pointer">
                              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload a fashion item</h4>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">Click to browse or drag and drop</p>
                              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                            </div>
                          )}
                          <input
                            ref={outfitMatchFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setOutfitMatchImageFile(file);
                                setOutfitMatchImagePreview(URL.createObjectURL(file));
                                setOutfitMatchResults({});
                              }
                            }}
                            className="hidden"
                          />
                        </div>

                        {/* Match Button */}
                        {outfitMatchImageFile && (
                          <button
                            onClick={async () => {
                              setIsOutfitMatching(true);
                              setOutfitMatchError(null);
                              
                              try {
                                const formData = new FormData();
                                formData.append('file', outfitMatchImageFile);

                                const response = await fetch(`${API_URL}/api/ai/outfit-match`, {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (!response.ok) {
                                  throw new Error(`Failed to match outfit: ${response.status}`);
                                }

                                const data = await response.json();
                                
                                // Transform API response - keep it grouped by category
                                const categoryResults: { [key: string]: any[] } = {};
                                
                                // Process each category from the API
                                const categories = ['Topwear', 'Bottomwear', 'Footwear', 'Accessories'];
                                for (const category of categories) {
                                  const items = data.recommended_outfit[category] || [];
                                  if (items.length > 0) {
                                    categoryResults[category] = items.map((item: any, index: number) => ({
                                      id: `${category}-${index}`,
                                      title: item.description || item.product_name || item.productDisplayName || 'Fashion Item',
                                      image: `${API_URL}/api/ai/dataset/images/${item.image || item.image_path}`,
                                      category: category,
                                      match: Math.floor(Math.random() * 10) + 85,
                                      description: `${item.color || item.base_color || ''} ${item.sub_category || category}`.trim(),
                                      itemData: item
                                    }));
                                  }
                                }
                                
                                setOutfitMatchResults(categoryResults);
                              } catch (error) {
                                console.error('Outfit matching error:', error);
                                setOutfitMatchError(error instanceof Error ? error.message : 'Failed to match outfit. Please try again.');
                              } finally {
                                setIsOutfitMatching(false);
                              }
                            }}
                            disabled={isOutfitMatching}
                            className="w-full py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                          >
                            {isOutfitMatching ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Finding Matches...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                Find Matching Outfits
                              </>
                            )}
                          </button>
                        )}

                        {/* Error Message */}
                        {outfitMatchError && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <p className="text-red-600 dark:text-red-400 font-medium">{outfitMatchError}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Results Section - Below Upload */}
                      {isOutfitMatching ? (
                        <div className="bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-900/10 dark:to-purple-900/10 rounded-2xl p-12 text-center">
                          <Loader2 className="w-16 h-16 animate-spin text-rose-600 dark:text-rose-400 mx-auto mb-4" />
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analyzing Your Outfit</h4>
                          <p className="text-gray-600 dark:text-gray-400">Finding the perfect matches for you...</p>
                        </div>
                      ) : Object.keys(outfitMatchResults).length > 0 ? (
                        <div className="space-y-8">
                          {Object.entries(outfitMatchResults).map(([category, items]) => (
                            <div key={category}>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                  {category === 'Topwear' && <Shirt className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
                                  {category === 'Bottomwear' && <Shirt className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                                  {category === 'Footwear' && <Shirt className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                  {category === 'Accessories' && <Gem className="w-6 h-6 text-pink-600 dark:text-pink-400" />}
                                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{category}</h4>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{items.length} items</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((result) => (
                                  <div key={result.id} className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="relative overflow-hidden aspect-square">
                                      <img src={result.image} alt={result.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                      <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg">
                                        <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{result.match}% Match</span>
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{result.title}</h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">{result.description}</p>
                                      <div className="flex gap-2">
                                        <button className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium">
                                          View Details
                                        </button>
                                        <button
                                          onClick={() => handleSaveToWishlist(result.image)}
                                          className={`p-2 rounded-lg transition-all ${
                                            savedDesigns.includes(result.image)
                                              ? 'bg-rose-600 text-white border-rose-600'
                                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                          }`}
                                          title={savedDesigns.includes(result.image) ? 'Saved to My Designs' : 'Save to My Designs'}
                                        >
                                          <Heart className={`w-4 h-4 ${
                                            savedDesigns.includes(result.image)
                                              ? 'fill-current'
                                              : 'text-gray-600 dark:text-gray-400'
                                          }`} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}

                {activeFeature === 'occasion' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">Smart Occasion Styling</h3>
                          <p className="text-rose-100">Get AI-powered complete outfit recommendations for any occasion</p>
                        </div>
                        <Sparkles className="w-16 h-16 opacity-50" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Occasion */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Occasion
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['casual', 'party', 'formal', 'sports'] as const).map((occ) => (
                              <button
                                key={occ}
                                onClick={() => setOccasionOccasion(occ)}
                                className={`px-4 py-3 rounded-xl font-medium capitalize transition-all ${
                                  occasionOccasion === occ
                                    ? 'bg-rose-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {occ}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Style */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Style
                          </label>
                          <select
                            value={occasionStyle}
                            onChange={(e) => setOccasionStyle(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                          >
                            <option value="casual">Casual</option>
                            <option value="streetwear">Streetwear</option>
                            <option value="elegant">Elegant</option>
                            <option value="sporty">Sporty</option>
                            <option value="minimal">Minimal</option>
                          </select>
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Gender
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['male', 'female'] as const).map((gen) => (
                              <button
                                key={gen}
                                onClick={() => setOccasionGender(gen)}
                                className={`px-4 py-3 rounded-xl font-medium capitalize transition-all ${
                                  occasionGender === gen
                                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {gen}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Season */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Season
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['summer', 'winter', 'all'] as const).map((season) => (
                              <button
                                key={season}
                                onClick={() => setOccasionSeason(season)}
                                className={`px-3 py-3 rounded-xl font-medium capitalize transition-all text-sm ${
                                  occasionSeason === season
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {season}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Preference */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Color Preference
                          </label>
                          <select
                            value={occasionColor}
                            onChange={(e) => setOccasionColor(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                          >
                            <option value="any">Any</option>
                            <option value="light">Light Colors</option>
                            <option value="dark">Dark Colors</option>
                            <option value="neutral">Neutral Colors</option>
                          </select>
                        </div>

                        {/* Outfit Type */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Outfit Type
                          </label>
                          <select
                            value={occasionType}
                            onChange={(e) => setOccasionType(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                          >
                            <option value="top-bottom">Top + Bottom</option>
                            <option value="dress">Dress</option>
                            <option value="full-outfit">Full Outfit</option>
                          </select>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={async () => {
                          setIsGeneratingOccasion(true);
                          setOccasionError(null);
                          
                          try {
                            const response = await fetch(`${API_URL}/api/ai/occasion-styling`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                occasion: occasionOccasion,
                                style: occasionStyle,
                                gender: occasionGender,
                                season: occasionSeason,
                                color: occasionColor,
                                outfit_type: occasionType
                              })
                            });

                            if (!response.ok) {
                              throw new Error('Failed to generate outfits');
                            }

                            const data = await response.json();
                            
                            // Transform API response to frontend format
                            const formattedOutfits = data.outfits.map((outfit: any) => ({
                              id: outfit.id,
                              match: outfit.match,
                              title: `${occasionOccasion.charAt(0).toUpperCase() + occasionOccasion.slice(1)} Outfit ${outfit.id}`,
                              clothing: outfit.clothing,
                              footwear: outfit.footwear,
                              accessories: outfit.accessories,
                              // Use actual images from dataset
                              images: {
                                clothing: outfit.clothing?.type === 'dress' 
                                  ? outfit.clothing.dress?.image 
                                  : {
                                      top: outfit.clothing?.top?.image,
                                      bottom: outfit.clothing?.bottom?.image
                                    },
                                footwear: outfit.footwear?.image,
                                accessories: outfit.accessories?.map((a: any) => a.image) || []
                              }
                            }));

                            setOccasionResults(formattedOutfits);
                          } catch (error) {
                            console.error('Occasion styling error:', error);
                            setOccasionError('Failed to generate outfit combinations. Please try again.');
                          } finally {
                            setIsGeneratingOccasion(false);
                          }
                        }}
                        disabled={isGeneratingOccasion}
                        className="w-full py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isGeneratingOccasion ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Outfits...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generate Outfit Combinations
                          </>
                        )}
                      </button>

                      {/* Error Message */}
                      {occasionError && (
                        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-600 dark:text-red-400 font-medium">{occasionError}</p>
                          </div>
                        </div>
                      )}

                      {/* Results */}
                      {occasionResults.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Perfect Outfits</h4>
                          <div className="grid md:grid-cols-3 gap-6">
                            {occasionResults.map((outfit) => (
                              <motion.div
                                key={outfit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: outfit.id * 0.1 }}
                                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                              >
                                {/* Display Images Grid */}
                                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-100 dark:bg-gray-900">
                                  {outfit.clothing?.type === 'dress' && outfit.images?.clothing ? (
                                    <img 
                                      src={`${API_URL}/api/ai/dataset/images/${outfit.images.clothing}`} 
                                      alt="Dress"
                                      className="col-span-2 w-full h-48 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <>
                                      {outfit.images?.clothing?.top && (
                                        <img 
                                          src={`${API_URL}/api/ai/dataset/images/${outfit.images.clothing.top}`} 
                                          alt="Top"
                                          className="w-full h-32 object-cover rounded-lg"
                                        />
                                      )}
                                      {outfit.images?.clothing?.bottom && (
                                        <img 
                                          src={`${API_URL}/api/ai/dataset/images/${outfit.images.clothing.bottom}`} 
                                          alt="Bottom"
                                          className="w-full h-32 object-cover rounded-lg"
                                        />
                                      )}
                                    </>
                                  )}
                                  {outfit.images?.footwear && (
                                    <img 
                                      src={`${API_URL}/api/ai/dataset/images/${outfit.images.footwear}`} 
                                      alt="Footwear"
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                  )}
                                  {outfit.images?.accessories?.[0] && (
                                    <img 
                                      src={`${API_URL}/api/ai/dataset/images/${outfit.images.accessories[0]}`} 
                                      alt="Accessory"
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                  )}
                                </div>
                                <div className="absolute top-3 right-3 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  {outfit.match}% Match
                                </div>
                                
                                <div className="p-5 space-y-4">
                                  <h5 className="text-lg font-bold text-gray-900 dark:text-white">{outfit.title}</h5>
                                  
                                  {/* Clothing */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clothing</p>
                                    {outfit.clothing?.type === 'dress' ? (
                                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Shirt className="w-4 h-4 text-rose-600" />
                                        <span className="capitalize">{outfit.clothing.dress?.name || 'Dress'}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                          <Shirt className="w-4 h-4 text-rose-600" />
                                          <span className="capitalize">{outfit.clothing?.top?.name || 'Top'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                          <Shirt className="w-4 h-4 text-purple-600" />
                                          <span className="capitalize">{outfit.clothing?.bottom?.name || 'Bottom'}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Footwear */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Footwear</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                      <Shirt className="w-4 h-4 text-blue-600" />
                                      <span className="capitalize">{outfit.footwear?.name || 'Shoes'}</span>
                                    </div>
                                  </div>

                                  {/* Accessories */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Accessories</p>
                                    <div className="flex flex-wrap gap-2">
                                      {outfit.accessories?.map((acc: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium"
                                        >
                                          <Gem className="w-3 h-3" />
                                          {acc?.name || acc}
                                        </span>
                                      )) || (
                                        <span className="text-xs text-gray-500">No accessories</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-3">
                                    <button className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium">
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        // Save the primary clothing image
                                        const imageToSave = outfit.clothing?.type === 'dress'
                                          ? outfit.images?.clothing
                                          : outfit.images?.clothing?.top;
                                        if (imageToSave) {
                                          handleSaveToWishlist(`${API_URL}/api/ai/dataset/images/${imageToSave}`);
                                        }
                                      }}
                                      className={`p-2 rounded-lg transition-all ${
                                        (() => {
                                          const imageToCheck = outfit.clothing?.type === 'dress'
                                            ? outfit.images?.clothing
                                            : outfit.images?.clothing?.top;
                                          return imageToCheck && savedDesigns.includes(`${API_URL}/api/ai/dataset/images/${imageToCheck}`)
                                            ? 'bg-rose-600 text-white'
                                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600';
                                        })()
                                      }`}
                                      title="Save to My Designs"
                                    >
                                      <Heart className={`w-4 h-4 ${
                                        (() => {
                                          const imageToCheck = outfit.clothing?.type === 'dress'
                                            ? outfit.images?.clothing
                                            : outfit.images?.clothing?.top;
                                          return imageToCheck && savedDesigns.includes(`${API_URL}/api/ai/dataset/images/${imageToCheck}`)
                                            ? 'fill-current'
                                            : 'text-gray-600 dark:text-gray-400';
                                        })()
                                      }`} />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeFeature === 'trends' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Header with Toggle */}
                    <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">Fashion Trends Dashboard</h3>
                          <p className="text-rose-100">
                            {trendsView === 'global' ? 'Discover what\'s trending globally' : 'Your personal fashion insights'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
                          <button
                            onClick={() => {
                              setTrendsView('global');
                              setTrendsData(null);
                              fetchTrends('global');
                            }}
                            className={`px-4 py-2 rounded-md transition-all ${
                              trendsView === 'global'
                                ? 'bg-white text-rose-600 font-semibold'
                                : 'text-white hover:bg-white/10'
                            }`}
                          >
                            Global Trends
                          </button>
                          <button
                            onClick={() => {
                              setTrendsView('personal');
                              setTrendsData(null);
                              fetchTrends('personal');
                            }}
                            className={`px-4 py-2 rounded-md transition-all ${
                              trendsView === 'personal'
                                ? 'bg-white text-rose-600 font-semibold'
                                : 'text-white hover:bg-white/10'
                            }`}
                          >
                            My Trends
                          </button>
                        </div>
                      </div>
                    </div>

                    {isLoadingTrends ? (
                      <div className="bg-white rounded-3xl shadow-xl p-12">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-rose-600 mx-auto mb-3" />
                          <p className="text-gray-700 font-medium">Loading trends...</p>
                        </div>
                      </div>
                    ) : trendsError ? (
                      <div className="bg-white rounded-3xl shadow-xl p-12">
                        <div className="text-center text-red-500">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                          <h4 className="text-xl font-bold mb-2">Error Loading Trends</h4>
                          <p className="text-gray-600 mb-4">{trendsError}</p>
                          <button
                            onClick={() => fetchTrends(trendsView)}
                            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : !trendsData || trendsData.totalSearches === 0 ? (
                      <div className="bg-white rounded-3xl shadow-xl p-12">
                        <div className="text-center text-gray-400">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                          <h4 className="text-xl font-bold text-gray-600 mb-2">
                            {trendsView === 'personal' ? 'No Personal Data Yet' : 'No Trends Available'}
                          </h4>
                          <p>
                            {trendsView === 'personal'
                              ? 'Start generating designs to see your personal trends!'
                              : 'Be the first to generate designs and set trends!'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Seasonal Trends - Only for Global */}
                        {trendsView === 'global' && trendsData.seasonalTrends && trendsData.seasonalTrends.length > 0 && (
                          <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-rose-600" />
                              Trending Styles
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4">
                              {trendsData.seasonalTrends.map((item: any, index: number) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 capitalize">{item.trend}</span>
                                    <span className="text-sm text-gray-600">{item.popularity}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        index === 0 ? 'bg-rose-500' :
                                        index === 1 ? 'bg-purple-500' :
                                        index === 2 ? 'bg-amber-500' :
                                        index === 3 ? 'bg-blue-500' :
                                        index === 4 ? 'bg-green-500' :
                                        'bg-pink-500'
                                      }`}
                                      style={{ width: `${item.popularity}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending Outfits */}
                        {trendsData.topOutfits && trendsData.topOutfits.length > 0 && (
                          <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Wand2 className="w-5 h-5 text-rose-600" />
                              {trendsView === 'global' ? 'Trending Outfit Combinations' : 'Your Favorite Combinations'}
                            </h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {trendsData.topOutfits.map((outfit: any, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h5 className="font-bold text-gray-900 capitalize">
                                      {outfit.style || 'Casual'} Look
                                    </h5>
                                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                                      {trendsView === 'global' ? `${outfit.searches || outfit.count} searches` : `${outfit.count} times`}
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Shirt className="w-4 h-4 text-rose-600" />
                                      <span className="capitalize">{outfit.topwear}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Shirt className="w-4 h-4 text-purple-600" />
                                      <span className="capitalize">{outfit.bottomwear}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Most Searched Items */}
                        {(trendsData.topTopwear || trendsData.topBottomwear) && (
                          <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Search className="w-5 h-5 text-rose-600" />
                              {trendsView === 'global' ? 'Most Searched Items' : 'Your Most Used Items'}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Topwear */}
                              {trendsData.topTopwear && trendsData.topTopwear.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-gray-700 mb-3">Topwear</h5>
                                  <div className="space-y-2">
                                    {trendsData.topTopwear.map((item: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                                          <span className="text-gray-900 capitalize">{item.item}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                                          {trendsView === 'global' && item.change && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                              item.change.startsWith('+') 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                              {item.change}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Bottomwear */}
                              {trendsData.topBottomwear && trendsData.topBottomwear.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-gray-700 mb-3">Bottomwear</h5>
                                  <div className="space-y-2">
                                    {trendsData.topBottomwear.map((item: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                                          <span className="text-gray-900 capitalize">{item.item}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                                          {trendsView === 'global' && item.change && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                              item.change.startsWith('+') 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                              {item.change}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Trending Fashion Images - Only for Global */}
                        {trendsView === 'global' && trendsData.trendingImages && trendsData.trendingImages.length > 0 && (
                          <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-rose-600" />
                              Trending Fashion Looks
                            </h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {trendsData.trendingImages.map((image: any) => (
                                <motion.div
                                  key={image.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: image.id * 0.1 }}
                                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"
                                >
                                  <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                      <h5 className="font-bold text-lg mb-1">{image.title}</h5>
                                      <p className="text-sm text-gray-200">{image.category}</p>
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-2">
                                    <div className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                                      Trending
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveToWishlist(image.url);
                                      }}
                                      className={`p-1.5 rounded-full transition-all ${
                                        savedDesigns.includes(image.url)
                                          ? 'bg-rose-600 text-white shadow-lg'
                                          : 'bg-white/90 text-gray-700 hover:bg-rose-50 hover:text-rose-600 shadow-md backdrop-blur-sm'
                                      }`}
                                      title={savedDesigns.includes(image.url) ? 'Saved to My Designs' : 'Save to My Designs'}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${
                                        savedDesigns.includes(image.url) ? 'fill-current' : ''
                                      }`} />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stats Summary */}
                        <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-3xl shadow-xl p-6">
                          <div className="text-center">
                            <p className="text-gray-600 mb-2">
                              {trendsView === 'global' ? 'Total Global Searches' : 'Your Total Searches'}
                            </p>
                            <p className="text-4xl font-bold text-rose-600">
                              {trendsData.totalSearches?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">in the last 30 days</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeFeature === 'mydesigns' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold mb-2">My Designs Collection</h3>
                          <p className="text-rose-100">
                            {searchQuery.trim() 
                              ? `Showing ${searchResults.designs.length} design${searchResults.designs.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                              : 'Your saved AI-generated fashion designs'
                            }
                          </p>
                        </div>
                        <Heart className="w-16 h-16 opacity-50" />
                      </div>
                    </div>

                    {(() => {
                      const designsToShow = searchQuery.trim() ? searchResults.designs : savedDesigns;
                      return designsToShow.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {designsToShow.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group rounded-2xl overflow-hidden shadow-lg bg-white"
                          >
                            <img 
                              src={image} 
                              alt={`Saved design ${index + 1}`} 
                              className="w-full h-80 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center justify-center gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = image;
                                      link.download = `design-${index + 1}.png`;
                                      link.click();
                                    }}
                                    className="p-3 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors"
                                    title="Download"
                                  >
                                    <Download className="w-5 h-5 text-gray-700" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={async () => {
                                      if (navigator.share) {
                                        try {
                                          await navigator.share({
                                            title: 'My Fashion Design',
                                            text: 'Check out my AI-generated fashion design!',
                                            url: window.location.href
                                          });
                                        } catch (err) {
                                          console.log('Share cancelled');
                                        }
                                      } else {
                                        navigator.clipboard.writeText(image);
                                        alert('Image link copied to clipboard!');
                                      }
                                    }}
                                    className="p-3 bg-white rounded-full shadow-lg hover:bg-purple-50 transition-colors"
                                    title="Share"
                                  >
                                    <Share2 className="w-5 h-5 text-gray-700" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={async () => {
                                      try {
                                        const response = await fetch('http://localhost:5000/api/user/saved-designs', {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          credentials: 'include',
                                          body: JSON.stringify({ imageUrl: image }),
                                        });
                                        if (response.ok) {
                                          const data = await response.json();
                                          setSavedDesigns(data.savedDesigns || []);
                                        }
                                      } catch (error) {
                                        console.error('Failed to delete design:', error);
                                      }
                                    }}
                                    className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs px-3 py-1 rounded-full">
                              Design #{index + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
                        {searchQuery.trim() ? (
                          <>
                            <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matching Designs</h3>
                            <p className="text-gray-600 mb-6">
                              No designs found matching "{searchQuery}". Try a different search term.
                            </p>
                            <button
                              onClick={() => setSearchQuery('')}
                              className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                            >
                              Clear Search
                            </button>
                          </>
                        ) : (
                          <>
                            <Heart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                            <h4 className="text-2xl font-bold text-gray-700 mb-2">No Saved Designs Yet</h4>
                            <p className="text-gray-500 mb-6">Start creating amazing fashion designs and save your favorites here!</p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setActiveFeature('prompt')}
                              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                            >
                              Create Your First Design
                            </motion.button>
                          </>
                        )}
                      </div>
                    );
                    })()}
                  </motion.div>
                )}

                {activeFeature === 'profile' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                            {selectedAvatar || user?.avatar ? (
                              <img src={selectedAvatar || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-full h-full text-gray-400 p-6" />
                            )}
                          </div>
                          <button
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-3xl font-bold mb-2">{user?.name || 'Fashion Creator'}</h3>
                          <p className="text-rose-100 mb-4">{user?.email}</p>
                          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="bg-white/20 rounded-lg px-4 py-2">
                              <div className="text-2xl font-bold">{savedDesigns.length}</div>
                              <div className="text-xs text-rose-100">Saved Designs</div>
                            </div>
                            <div className="bg-white/20 rounded-lg px-4 py-2">
                              <div className="text-2xl font-bold">{savedPalettes.length}</div>
                              <div className="text-xs text-rose-100">Color Palettes</div>
                            </div>
                            <div className="bg-white/20 rounded-lg px-4 py-2">
                              <div className="text-2xl font-bold">{generatedImages.length}</div>
                              <div className="text-xs text-rose-100">Generated</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Selection */}
                    {isEditingProfile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-white rounded-3xl shadow-xl p-6 mb-6"
                      >
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Choose Your Avatar</h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                          {[
                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
                            'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1',
                            'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2',
                            'https://api.dicebear.com/7.x/lorelei/svg?seed=Fashion1',
                            'https://api.dicebear.com/7.x/lorelei/svg?seed=Fashion2',
                            'https://api.dicebear.com/7.x/personas/svg?seed=Style1',
                            'https://api.dicebear.com/7.x/personas/svg?seed=Style2',
                          ].map((avatar, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedAvatar(avatar)}
                              className={`w-full aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                                selectedAvatar === avatar ? 'border-rose-500 shadow-lg' : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                            </motion.button>
                          ))}
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => {
                              setIsEditingProfile(false);
                              // Here you would save to backend
                            }}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingProfile(false);
                              setSelectedAvatar(user?.avatar || '');
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Profile Settings */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white rounded-3xl shadow-xl p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-rose-600" />
                          Account Settings
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                              value={profileBio}
                              onChange={(e) => setProfileBio(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                              placeholder="Tell us about your fashion style..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-3xl shadow-xl p-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          Activity Stats
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-rose-100 rounded-lg">
                                <ImageIcon className="w-6 h-6 text-rose-600" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Total Designs Created</div>
                                <div className="text-2xl font-bold text-gray-900">{generatedImages.length + savedDesigns.length}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-purple-100 rounded-lg">
                                <Palette className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Color Palettes</div>
                                <div className="text-2xl font-bold text-gray-900">{savedPalettes.length}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <Heart className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Saved Favorites</div>
                                <div className="text-2xl font-bold text-gray-900">{savedDesigns.length}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveFeature('prompt')}
                          className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow text-left"
                        >
                          <Sparkles className="w-8 h-8 text-rose-600 mb-2" />
                          <div className="font-semibold text-gray-900">Create New Design</div>
                          <div className="text-sm text-gray-600">Start generating</div>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveFeature('mydesigns')}
                          className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow text-left"
                        >
                          <Folder className="w-8 h-8 text-purple-600 mb-2" />
                          <div className="font-semibold text-gray-900">View My Designs</div>
                          <div className="text-sm text-gray-600">Browse collection</div>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveFeature('trends')}
                          className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl hover:shadow-md transition-shadow text-left"
                        >
                          <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                          <div className="font-semibold text-gray-900">Explore Trends</div>
                          <div className="text-sm text-gray-600">See what's hot</div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-3xl font-bold mb-2">Prompt-Based Design Creator</h3>
                        <p className="text-rose-100">Describe your vision and let AI bring your fashion ideas to life</p>
                      </div>
                      <Palette className="w-16 h-16 opacity-50" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 overflow-visible">
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Style Preset</label>
                          <select
                            value={stylePreset}
                            onChange={(e) => setStylePreset(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {['Minimalist', 'Boho', 'Formal', 'Streetwear'].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topwear *</label>
                          <input
                            type="text"
                            value={topwear}
                            onChange={(e) => setTopwear(e.target.value)}
                            placeholder="e.g., silk blouse, leather jacket, cotton shirt"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bottomwear *</label>
                          <input
                            type="text"
                            value={bottomwear}
                            onChange={(e) => setBottomwear(e.target.value)}
                            placeholder="e.g., tailored pants, denim jeans, pleated skirt"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accessories (Optional)</label>
                          <input
                            type="text"
                            value={accessories}
                            onChange={(e) => setAccessories(e.target.value)}
                            placeholder="e.g., pearl necklace, leather belt, watch"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Style (Optional)</label>
                          <input
                            type="text"
                            value={designStyle}
                            onChange={(e) => setDesignStyle(e.target.value)}
                            placeholder="e.g., formal, casual, streetwear, elegant"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>

                        {generationError && (
                          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 shadow-md">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{generationError}</p>
                            </div>
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerate}
                          disabled={isGenerating || !topwear.trim() || !bottomwear.trim()}
                          className="w-full py-4 bg-gradient-to-r from-rose-600 to-purple-600 dark:from-rose-500 dark:to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:from-rose-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating Design...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Design
                            </>
                          )}
                        </motion.button>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quick fill examples:</div>
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => {
                                setTopwear('silk blouse');
                                setBottomwear('pencil skirt');
                                setAccessories('pearl necklace');
                                setDesignStyle('formal');
                              }}
                              className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Formal Office
                            </button>
                            <button 
                              onClick={() => {
                                setTopwear('graphic t-shirt');
                                setBottomwear('distressed jeans');
                                setAccessories('sneakers');
                                setDesignStyle('streetwear');
                              }}
                              className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Streetwear
                            </button>
                            <button 
                              onClick={() => {
                                setTopwear('cotton shirt');
                                setBottomwear('chinos');
                                setAccessories('watch');
                                setDesignStyle('casual');
                              }}
                              className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Casual
                            </button>
                            <button 
                              onClick={() => {
                                setTopwear('evening gown top');
                                setBottomwear('flowing skirt');
                                setAccessories('diamond earrings');
                                setDesignStyle('elegant');
                              }}
                              className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            >
                              Elegant Evening
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Canvas Preview</h3>
                      {isGenerating ? (
                        <div className="flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-xl h-[500px]">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-rose-600 dark:text-rose-400 animate-spin mx-auto mb-3" />
                            <p className="text-gray-700 dark:text-gray-300 font-medium">Creating your designs...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take a few minutes</p>
                          </div>
                        </div>
                      ) : generatedImages.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2">
                          {generatedImages.slice(0, 6).map((image, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group rounded-xl overflow-hidden max-w-full"
                            >
                              <img
                                src={image}
                                alt={`Generated design ${index + 1}`}
                                className="w-full max-w-full h-80 object-cover"
                                style={{ filter: activeFeature === 'prompt' && applyColorAdjustments ? imageFilterCSS() : undefined }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedImage(image)} className="p-2 bg-white dark:bg-gray-800 rounded-full">
                                  <Eye className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 bg-white dark:bg-gray-800 rounded-full">
                                  <Pencil className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSaveToWishlist(image)} className="p-2 bg-white dark:bg-gray-800 rounded-full">
                                  <SaveIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-xl h-[500px]">
                          <div className="text-center text-gray-400 dark:text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                            <p>Your generated designs will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </motion.div>
                {/* Preview Modal */}
                <AnimatePresence>
                  {selectedImage && (
                    <>
                      <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                      />
                      <div className="fixed inset-0 z-50 grid place-items-center p-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
                        >
                          <div className="p-4 border-b flex items-center justify-between">
                            <div className="font-semibold text-gray-900">Design Preview</div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (selectedImage) handleSaveToWishlist(selectedImage);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm inline-flex items-center gap-2"
                              >
                                <SaveIcon className="w-4 h-4" /> Save
                              </button>
                              <button
                                onClick={() => setSelectedImage(null)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <img src={selectedImage} alt="Selected design" className="w-full h-auto rounded-xl" />
                          </div>
                        </motion.div>
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
