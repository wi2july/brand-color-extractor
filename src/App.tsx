import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/color/ImageUploader';
import { ColorPalette } from './components/color/ColorPalette';
import { ManualColorInput } from './components/color/ManualColorInput';
import { CompliancePanel } from './components/compliance/CompliancePanel';
import { BulkUploader } from './components/bulk/BulkUploader';
import { extractColorsFromImage, ExtractedColor } from './utils/colorExtractor';
import { Upload, Palette, Shield, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'image' | 'manual';

function App() {
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('image');
  const [showCompliance, setShowCompliance] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleImageUpload = useCallback(async (_file: File, imageUrl: string) => {
    setHasImage(true);
    setIsLoading(true);
    setError(null);
    try {
      const extractedColors = await extractColorsFromImage(imageUrl, 10);
      setColors(extractedColors);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract colors';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setColors([]);
    setHasImage(false);
    setError(null);
  }, []);

  const handleManualAdd = useCallback((color: { hex: string; rgb: [number, number, number] }) => {
    const [r, g, b] = color.rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const brightness = (r + g + b) / (3 * 255);
    setColors((prev) => [...prev, {
      hex: color.hex,
      rgb: color.rgb,
      frequency: 1,
      saturation: Math.round(saturation * 100) / 100,
      brightness: Math.round(brightness * 100) / 100,
    }]);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <Sparkles className="text-white" size={16} />
            </div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">
              Brand Compliance Color Extractor
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <span className="text-sm text-text-secondary">
              Free to use
            </span>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold text-text-primary mb-6 tracking-tight">
            Extract Brand Colors
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Upload an image to automatically extract your brand color palette.
            Compliant with FDA, WCAG, and USPTO standards.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'image'
                  ? 'text-text-primary border-b-2 border-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Upload size={16} />
              Image Upload
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'text-text-primary border-b-2 border-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Palette size={16} />
              Manual Input
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'image' && (
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  onClear={handleClear}
                />
              )}

              {activeTab === 'manual' && (
                <ManualColorInput onAdd={handleManualAdd} />
              )}
            </motion.div>
          </AnimatePresence>

          {isLoading && (
            <div className="mt-8 py-12 text-center border border-border bg-muted">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary text-sm">Extracting colors...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 border border-red-200 bg-red-50 flex items-start gap-3">
              <span className="text-red-600 font-medium text-sm flex-shrink-0">Error:</span>
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {colors.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Extracted Colors</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBulk(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-text-primary hover:bg-muted transition-colors"
                >
                  <Package size={16} />
                  Bulk Process
                </button>
                <button
                  onClick={() => setShowCompliance(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-text-primary hover:bg-muted transition-colors"
                >
                  <Shield size={16} />
                  Check Compliance
                </button>
              </div>
            </div>
            <ColorPalette
              key={colors.map(c => c.hex).join(',')}
              colors={colors}
              onExport={() => console.log('Export colors')}
            />
          </motion.div>
        )}

        {showCompliance && (
          <CompliancePanel
            colors={colors}
            onClose={() => setShowCompliance(false)}
          />
        )}

        {!hasImage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-8 border border-border hover:border-black transition-colors">
              <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto mb-4">
                <Upload size={20} className="text-text-primary" />
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2">
                Image Upload
              </h3>
              <p className="text-sm text-text-secondary">
                Drag & drop or click to upload PNG/JPG images up to 10MB
              </p>
            </div>

            <div className="text-center p-8 border border-border hover:border-black transition-colors">
              <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto mb-4">
                <Sparkles size={20} className="text-text-primary" />
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2">
                Smart Extraction
              </h3>
              <p className="text-sm text-text-secondary">
                AI-powered color analysis with automatic categorization
              </p>
            </div>

            <div className="text-center p-8 border border-border hover:border-black transition-colors">
              <div className="w-12 h-12 border border-border flex items-center justify-center mx-auto mb-4">
                <Shield size={20} className="text-text-primary" />
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2">
                Compliance Check
              </h3>
              <p className="text-sm text-text-secondary">
                Validate against FDA, WCAG 2.1, and industry standards
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              © 2026 Brand Compliance Color Extractor. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-sm text-text-muted hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="text-sm text-text-muted hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-muted text-center">
            Pantone color references are for informational purposes only. Commercial use requires official Pantone licensing.
          </p>
        </div>
      </footer>

      <BulkUploader
        isOpen={showBulk}
        onClose={() => setShowBulk(false)}
        onComplete={(results) => {
          console.log('Bulk processing complete:', results);
          setShowBulk(false);
        }}
      />

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 flex items-center justify-center border border-gray-400 hover:bg-gray-100 transition-all">✕</button>
            </div>
            <div className="p-6 text-sm text-text-secondary space-y-3">
              <p><strong>Data Processing:</strong> All image processing is performed locally in your browser using Canvas API. Images are never uploaded to any server.</p>
              <p><strong>No Data Collection:</strong> We do not collect, store, or transmit your uploaded images or extracted color data.</p>
              <p><strong>Cookies:</strong> This website does not use tracking cookies. Essential cookies may be used for theme preferences.</p>
              <p><strong>Third-Party Services:</strong> No third-party analytics or tracking services are used without your consent.</p>
              <p><strong>Contact:</strong> For privacy-related inquiries, please contact us through the website.</p>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setShowPrivacy(false)} className="px-6 py-2 bg-black text-white text-sm font-medium hover:opacity-80">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Terms of Service</h2>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 flex items-center justify-center border border-gray-400 hover:bg-gray-100 transition-all">✕</button>
            </div>
            <div className="p-6 text-sm text-text-secondary space-y-3">
              <p><strong>Acceptance of Terms:</strong> By using Brand Compliance Color Extractor, you agree to these terms. If you do not agree, please do not use the service.</p>
              <p><strong>Use of Service:</strong> This tool is provided free of charge for personal and commercial use. You may use extracted color data in your projects without attribution.</p>
              <p><strong>Pantone References:</strong> Pantone color references are for informational purposes only. Commercial use of Pantone marks requires official Pantone licensing.</p>
              <p><strong>Disclaimer:</strong> This tool provides color analysis for reference only. It does not constitute legal advice regarding FDA, WCAG, or USPTO compliance.</p>
              <p><strong>Limitation of Liability:</strong> The service is provided "as is" without warranty of any kind. We are not liable for any damages arising from use of this tool.</p>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setShowTerms(false)} className="px-6 py-2 bg-black text-white text-sm font-medium hover:opacity-80">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
