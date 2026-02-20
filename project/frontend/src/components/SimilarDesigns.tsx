import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Check,
  History,
  Image as ImageIcon,
  Layers,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';

const AI_SERVICE_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || '/api/ai';

interface SimilarDesignResult {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  matchScore?: number;
  palette?: string[];
  tags?: string[];
  source?: string;
}

interface SimilarDesignHistoryItem {
  id: string;
  timestamp: number;
  query: string;
  usedImage: boolean;
  results: SimilarDesignResult[];
}

const FALLBACK_RESULTS: SimilarDesignResult[] = [
  {
    id: 'sample-1',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    title: 'Runway Ready Gown',
    description: 'Sculpted satin silhouette with hand-embellished detailing.',
    matchScore: 0.91,
    palette: ['#111827', '#cbd5f5', '#f8fafc'],
    tags: ['Evening', 'Luxury', 'Satin'],
    source: 'Editorial Archive',
  },
  {
    id: 'sample-2',
    imageUrl: 'https://images.unsplash.com/photo-1521572160346-d37b075c1920?auto=format&fit=crop&w=800&q=80',
    title: 'Modern Minimalist Set',
    description: 'Two-piece structured set with architectural tailoring.',
    matchScore: 0.87,
    palette: ['#1f2937', '#d1d5db', '#f9fafb'],
    tags: ['Streetwear', 'Minimal', 'Tailored'],
    source: 'Lookbook 2024',
  },
  {
    id: 'sample-3',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    title: 'Silk Draped Dress',
    description: 'Fluid evening dress with asymmetrical drape and tonal belt.',
    matchScore: 0.83,
    palette: ['#111111', '#f3f4f6', '#d1d5db'],
    tags: ['Evening', 'Draped', 'Silk'],
    source: 'Studio Library',
  },
];

export function SimilarDesigns() {
  const [textQuery, setTextQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [topK, setTopK] = useState(6);
  const [textWeight, setTextWeight] = useState(50);
  const [includePalette, setIncludePalette] = useState(true);
  const [includeSilhouette, setIncludeSilhouette] = useState(true);
  const [includeTexture, setIncludeTexture] = useState(false);
  const [results, setResults] = useState<SimilarDesignResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<SimilarDesignHistoryItem[]>([]);

  const dropZoneRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const handleFileSelection = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit.');
      return;
    }
    setErrorMessage(null);
    setImageFile(file);
  }, []);

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    dropZoneRef.current?.classList.remove('border-rose-400', 'bg-rose-50/60');
  };

  const handleDragOver: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    dropZoneRef.current?.classList.add('border-rose-400', 'bg-rose-50/60');
  };

  const handleDragLeave: React.DragEventHandler<HTMLLabelElement> = () => {
    dropZoneRef.current?.classList.remove('border-rose-400', 'bg-rose-50/60');
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const buildRequestBody = () => {
    const formData = new FormData();
    const trimmedQuery = textQuery.trim();
    if (trimmedQuery) {
      formData.append('query', trimmedQuery);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('topK', String(topK));
    formData.append('textWeight', String(textWeight / 100));
    formData.append('includePalette', String(includePalette));
    formData.append('includeSilhouette', String(includeSilhouette));
    formData.append('includeTexture', String(includeTexture));
    return formData;
  };

  const normaliseResults = (payload: any): SimilarDesignResult[] => {
    if (!payload) return [];

    const rawResults = Array.isArray(payload.results) ? payload.results : payload;
    if (!Array.isArray(rawResults)) return [];

    return rawResults
      .map((item: any, index: number): SimilarDesignResult | null => {
        if (typeof item !== 'object' || !item) {
          return null;
        }
        
        // Use image_url from API, fallback to constructing URL from image_path
        const imageUrl = item.image_url || 
                        (item.image_path ? `http://localhost:8000/images/${item.image_path.split('/').pop()}` : null) ||
                        FALLBACK_RESULTS[index % FALLBACK_RESULTS.length]?.imageUrl;
        
        const palette = Array.isArray(item.palette)
          ? item.palette.filter((hex: unknown) => typeof hex === 'string')
          : undefined;
        const tags = Array.isArray(item.tags)
          ? item.tags.filter((tag: unknown) => typeof tag === 'string')
          : undefined;

        return {
          id: String(item.id ?? item.index ?? item.imageUrl ?? `result-${index}`),
          imageUrl: imageUrl,
          title: typeof item.title === 'string' ? item.title : undefined,
          description: typeof item.description === 'string' ? item.description : undefined,
          matchScore: typeof item.score === 'number' ? item.score : item.matchScore,
          palette,
          tags,
          source: typeof item.source === 'string' ? item.source : undefined,
        };
      })
      .filter((entry): entry is SimilarDesignResult => Boolean(entry?.imageUrl));
  };

  const performSearch = async () => {
    const trimmedQuery = textQuery.trim();
    if (!trimmedQuery && !imageFile) {
      setErrorMessage('Add a description or upload an image to search.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await fetch(`${AI_SERVICE_BASE_URL}/similar-designs`, {
        method: 'POST',
        body: buildRequestBody(),
        credentials: 'include',
      });

      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Similarity service returned ${response.status}: ${errorText}`);
      }

      const payload = await response.json();
      console.log('API Response Payload:', payload);
      
      const normalised = normaliseResults(payload);
      console.log('Normalised Results:', normalised);

      if (!normalised.length) {
        setResults(FALLBACK_RESULTS);
        setInfoMessage('Showing sample matches while we prepare the similarity service response.');
      } else {
        setResults(normalised);
      }

      const historyEntry: SimilarDesignHistoryItem = {
        id: `query-${Date.now()}`,
        timestamp: Date.now(),
        query: trimmedQuery || 'Image only search',
        usedImage: Boolean(imageFile),
        results: normalised.length ? normalised : FALLBACK_RESULTS,
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 6));
    } catch (error) {
      console.error('Search Error:', error);
      setResults(FALLBACK_RESULTS);
      setInfoMessage('We could not reach the similarity service. Displaying curated matches instead.');
      setErrorMessage(null);
    } finally {
      setIsSearching(false);
    }
  };

  const loadHistory = (item: SimilarDesignHistoryItem) => {
    setResults(item.results);
    setInfoMessage('Showing a previous search result set.');
  };

  const inferredFocus = useMemo(() => {
    if (includePalette && includeSilhouette && includeTexture) return 'Comprehensive match';
    if (includePalette && includeSilhouette) return 'Style + color';
    if (includePalette && includeTexture) return 'Color + fabric';
    if (includeSilhouette && includeTexture) return 'Silhouette + fabric';
    if (includePalette) return 'Color driven';
    if (includeSilhouette) return 'Silhouette driven';
    if (includeTexture) return 'Texture driven';
    return 'General similarity';
  }, [includePalette, includeSilhouette, includeTexture]);

  return (
    <div className="bg-white rounded-3xl shadow-xl px-6 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:w-80 xl:w-96 space-y-6">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              <Sparkles className="h-4 w-4" /> AI Similarity Search
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Find Similar Designs</h3>
              <p className="text-sm text-gray-500">
                Combine descriptive text with a reference image to surface the closest runway, archive, or in-house looks.
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Describe the style</label>
            <textarea
              value={textQuery}
              onChange={(event) => setTextQuery(event.target.value)}
              rows={4}
              placeholder="E.g. draped satin evening gown with structured shoulders and champagne palette"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Reference image</label>
            <label
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-rose-300"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleFileSelection(file);
                  }
                }}
              />
              {imagePreview ? (
                <div className="w-full">
                  <img
                    src={imagePreview}
                    alt="Uploaded reference"
                    className="mx-auto h-40 w-full max-w-xs rounded-lg object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold text-gray-700 shadow hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" /> Remove reference
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">Drag and drop or click to upload</div>
                  <div className="text-xs text-gray-400">PNG or JPG up to 10MB</div>
                </>
              )}
            </label>
            <p className="text-xs text-gray-400">The image helps CLIP anchor visual similarity alongside your description.</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Blend emphasis</span>
              <span className="text-xs text-gray-500">Text {textWeight}% · Image {100 - textWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={textWeight}
              onChange={(event) => setTextWeight(parseInt(event.target.value, 10))}
              className="w-full accent-rose-600"
            />
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Palette', value: includePalette, setter: setIncludePalette, icon: <Layers className="h-4 w-4" /> },
                { label: 'Silhouette', value: includeSilhouette, setter: setIncludeSilhouette, icon: <ImageIcon className="h-4 w-4" /> },
                { label: 'Texture', value: includeTexture, setter: setIncludeTexture, icon: <Bookmark className="h-4 w-4" /> },
              ].map(({ label, value, setter, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setter((prev) => !prev)}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 font-medium transition ${
                    value ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">{inferredFocus}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <label className="flex items-center justify-between text-sm font-semibold text-gray-800">
              Number of looks
              <span className="text-xs text-gray-500">{topK} results</span>
            </label>
            <input
              type="range"
              min={3}
              max={12}
              value={topK}
              onChange={(event) => setTopK(parseInt(event.target.value, 10))}
              className="mt-2 w-full accent-rose-600"
            />
          </div>

          <button
            type="button"
            onClick={performSearch}
            disabled={isSearching}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Searching runway looks...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" /> Find similar designs
              </>
            )}
          </button>

          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {history.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <History className="h-4 w-4" /> Recent searches
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadHistory(item)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-600 hover:border-rose-300 hover:bg-rose-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="line-clamp-1 font-medium text-gray-700">{item.query}</span>
                      {item.usedImage && <ImageIcon className="h-3.5 w-3.5 text-rose-400" />}
                    </div>
                    <div className="mt-1 text-[10px] uppercase text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">Similarity matches</h4>
                <p className="text-sm text-gray-500">
                  Results update once the CLIP + FAISS service responds. Each card shows the confidence score and palette signals.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500">
                <Loader2 className={`h-4 w-4 ${isSearching ? 'animate-spin text-rose-500' : 'text-gray-400'}`} />
                {isSearching ? 'Querying embeddings' : `${results.length} curated looks`}
              </div>
            </div>

            {infoMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{infoMessage}</span>
              </div>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(isSearching ? Array.from({ length: Math.min(topK, 6) }) : results).map((item, index) => {
                if (isSearching) {
                  return (
                    <div
                      key={`skeleton-${index}`}
                      className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
                    >
                      <div className="h-52 w-full animate-pulse rounded-xl bg-gray-200" />
                      <div className="mt-4 space-y-2">
                        <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  );
                }

                // Type guard for valid result items
                const result = item as SimilarDesignResult;
                if (!result || !result.id) {
                  return null;
                }

                const palette = result.palette && result.palette.length > 0 ? result.palette.slice(0, 5) : null;

                return (
                  <article key={result.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative">
                      <img
                        src={result.imageUrl}
                        alt={result.title || 'Similar design match'}
                        className="h-56 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      {typeof result.matchScore === 'number' && (
                        <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          {(result.matchScore * 100).toFixed(1)}% match
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 px-4 py-4">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {result.title || 'Similar look suggestion'}
                        </h5>
                        {result.description && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{result.description}</p>
                        )}
                      </div>

                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.tags.slice(0, 4).map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600"
                            >
                              <Sparkles className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {palette && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">Palette</span>
                          <div className="flex flex-1 gap-1">
                            {palette.map((color: string) => (
                              <span
                                key={color}
                                className="h-5 flex-1 rounded-full"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {result.source && (
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-400">
                          <span>{result.source}</span>
                          <button className="font-semibold text-rose-500 hover:underline">View details</button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {!isSearching && results.length === 0 && (
              <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white/80 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                  <Search className="h-7 w-7 text-rose-500" />
                </div>
                <h5 className="mt-4 text-lg font-semibold text-gray-800">No matches yet</h5>
                <p className="mt-2 text-sm text-gray-500">
                  Start by adding a description or dropping in a reference look. We will surface near neighbors as soon as the embeddings are available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
