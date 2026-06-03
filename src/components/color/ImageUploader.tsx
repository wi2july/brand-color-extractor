import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File, imageUrl: string) => void;
  onClear?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PNG and JPG formats are supported';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onImageUpload(file, result);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    onClear?.();
  }, [onClear]);

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative">
          <div className="border border-border bg-muted">
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-64 object-contain"
            />
          </div>
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 w-8 h-8 bg-black text-white flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed transition-all duration-200
            ${isDragging ? 'border-black bg-muted' : 'border-border hover:border-text-secondary'}
            py-16 px-8
          `}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border border-border flex items-center justify-center">
              {isDragging ? (
                <Upload size={28} className="text-black" />
              ) : (
                <ImageIcon size={28} className="text-text-muted" />
              )}
            </div>
            <div className="text-center">
              <p className="text-text-primary font-medium text-base">
                Drop your image here, or click to browse
              </p>
              <p className="text-text-muted text-sm mt-2">
                Supports PNG, JPG (max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 py-3 px-4 border border-black bg-muted">
          <p className="text-text-primary text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
