import { useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5, disabled = false }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      alert(`Максимум ${maxPhotos} фотографий`);
      return;
    }

    setUploading(true);

    try {
      const newPhotos: string[] = [];
      
      for (const file of files) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert('Можно загружать только изображения');
          continue;
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('Размер файла не должен превышать 2MB');
          continue;
        }

        // Compress and convert to base64
        const compressedBase64 = await compressAndConvertToBase64(file);
        newPhotos.push(compressedBase64);
      }

      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Ошибка загрузки фотографий');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions (max 600px width/height for smaller files)
        const maxSize = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5); // 50% quality for smaller size
        resolve(compressedBase64);
      };
      
      img.onerror = reject;
      
      // Load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label className={`inline-block ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading || photos.length >= maxPhotos}
            className="sr-only"
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading || photos.length >= maxPhotos}
            className="flex items-center space-x-2"
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>
                {uploading ? 'Загрузка...' : 'Добавить фото'}
              </span>
            </span>
          </Button>
        </label>
        
        <span className="text-sm text-muted-foreground">
          {photos.length}/{maxPhotos} фотографий
        </span>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square">
                <img
                  src={photo}
                  alt={`Фото груза ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <div className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Фотографии груза не добавлены</p>
            <p className="text-sm text-muted-foreground">
              Добавьте фотографии для лучшего понимания груза
            </p>
          </div>
        </Card>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Максимальный размер файла: 2MB. Фотографии автоматически сжимаются для оптимизации
      </p>
    </div>
  );
}