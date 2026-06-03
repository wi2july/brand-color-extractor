import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileImage, Trash2, Download, Package } from 'lucide-react';
import { extractColorsFromImage, ExtractedColor } from '../../utils/colorExtractor';

interface BulkUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: BulkResult[]) => void;
}

export interface BulkResult {
  fileName: string;
  colors: ExtractedColor[];
  error?: string;
}

export const BulkUploader: React.FC<BulkUploaderProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkResult[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    setFiles(prev => [...prev, ...droppedFiles].slice(0, 100));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      file => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 100));
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(0);
    const newResults: BulkResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const imageUrl = URL.createObjectURL(file);
        const colors = await extractColorsFromImage(imageUrl, 10);
        newResults.push({ fileName: file.name, colors });
        URL.revokeObjectURL(imageUrl);
      } catch (error) {
        newResults.push({
          fileName: file.name,
          colors: [],
          error: 'Failed to extract colors'
        });
      }
      setProgress(((i + 1) / files.length) * 100);
    }

    setResults(newResults);
    setProcessing(false);
    onComplete(newResults);
  };

  const downloadResults = () => {
    const data = JSON.stringify(results, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-extraction-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl border border-border max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Package size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Bulk Processing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-gray-400 text-black hover:bg-gray-100 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {results.length === 0 ? (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-border p-8 text-center hover:border-black transition-colors cursor-pointer"
              >
                <Upload size={48} className="mx-auto mb-4 text-text-muted" />
                <p className="text-text-primary font-medium mb-2">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-text-secondary mb-4">
                  Support PNG/JPG, max 10MB per file, up to 100 files
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bulk-file-input"
                />
                <label
                  htmlFor="bulk-file-input"
                  className="px-4 py-2 bg-black text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                >
                  Select Files
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-text-primary">
                      {files.length} files selected
                    </h3>
                    <button
                      onClick={clearAll}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="max-h-60 overflow-auto border border-border">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <FileImage size={16} className="text-text-muted" />
                          <span className="text-sm text-text-primary truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-text-muted">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-text-muted hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={processFiles}
                    disabled={processing}
                    className="w-full mt-4 py-2 bg-black text-white font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : `Process ${files.length} Files`}
                  </button>

                  {processing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-secondary">Processing...</span>
                        <span className="text-text-primary">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <motion.div
                          className="h-full bg-black rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="font-medium text-text-primary mb-4">Processing Complete</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 border border-border">
                    <p className="text-2xl font-semibold text-text-primary">
                      {results.length}
                    </p>
                    <p className="text-sm text-text-secondary">Total Files</p>
                  </div>
                  <div className="p-4 border border-border">
                    <p className="text-2xl font-semibold text-green-600">
                      {results.filter(r => !r.error).length}
                    </p>
                    <p className="text-sm text-text-secondary">Successful</p>
                  </div>
                  <div className="p-4 border border-border">
                    <p className="text-2xl font-semibold text-red-600">
                      {results.filter(r => r.error).length}
                    </p>
                    <p className="text-sm text-text-secondary">Failed</p>
                  </div>
                </div>
              </div>

              <div className="border border-border max-h-60 overflow-auto mb-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b border-border last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileImage size={16} className="text-text-muted" />
                      <span className="text-sm text-text-primary">{result.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.error ? (
                        <span className="text-xs text-red-600">Failed</span>
                      ) : (
                        <span className="text-xs text-green-600">
                          {result.colors.length} colors
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadResults}
                  className="flex-1 py-2 bg-black text-white font-medium hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Results
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 py-2 border border-border text-text-primary font-medium hover:bg-muted transition-colors"
                >
                  Process More
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
