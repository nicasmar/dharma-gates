import React, { useState, useRef } from 'react';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
  disabled?: boolean;
}

interface UploadStatus {
  uploading: boolean;
  error: string | null;
}

export default function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5, 
  className = '',
  disabled = false 
}: PhotoUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ uploading: false, error: null });

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlUploading, setUrlUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    if (photos.length + files.length > maxPhotos) {
      setUploadStatus({
        uploading: false,
        error: `Maximum ${maxPhotos} photos allowed. You can add ${maxPhotos - photos.length} more.`
      });
      return;
    }

    setUploadStatus({ uploading: true, error: null });

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Client-side validation
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Upload response not ok:', response.status, response.statusText);
          try {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
          } catch (jsonError) {
            console.error('Failed to parse error response:', jsonError);
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
          }
        }

        const result = await response.json();
        return result.url;
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      console.log('New photo URLs:', newPhotoUrls);
      onPhotosChange([...photos, ...newPhotoUrls]);
      setUploadStatus({ uploading: false, error: null });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const handleDeletePhoto = (index: number) => {
    // Simply remove from photos array - actual deletion from storage will happen on form save
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    // Check if adding this URL would exceed the maximum
    if (photos.length >= maxPhotos) {
      setUploadStatus({
        uploading: false,
        error: `Maximum ${maxPhotos} photos allowed.`
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setUploadStatus({
        uploading: false,
        error: 'Please enter a valid URL'
      });
      return;
    }

    setUrlUploading(true);
    setUploadStatus({ uploading: false, error: null });

    try {
      // Fetch the image from the URL
      const response = await fetch('/api/upload-photo-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: urlInput }),
      });

      if (!response.ok) {
        console.error('URL upload response not ok:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.error('Error data:', errorData);
          throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('URL upload result:', result);
      
      onPhotosChange([...photos, result.url]);
      setUrlInput('');
      setShowUrlInput(false);
    } catch (error) {
      console.error('URL upload error:', error);
      setUploadStatus({
        uploading: false,
        error: error instanceof Error ? error.message : 'Failed to upload from URL'
      });
    } finally {
      setUrlUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Upload buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploadStatus.uploading || urlUploading || photos.length >= maxPhotos}
            className="px-4 py-2 bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploadStatus.uploading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Files
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={disabled || uploadStatus.uploading || urlUploading || photos.length >= maxPhotos}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Add from URL
          </button>
          
          <span className="text-sm text-gray-600">
            {photos.length} / {maxPhotos} photos
          </span>
        </div>

        {/* URL input section */}
        {showUrlInput && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#286B88] focus:border-[#286B88]"
                disabled={disabled || urlUploading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlUpload();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleUrlUpload}
                disabled={disabled || urlUploading || !urlInput.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {urlUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Image'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                }}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {uploadStatus.error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {uploadStatus.error}
          </div>
        )}

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                     onError={(e) => {
                     (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                   }}
                />
                                 {!disabled && (
                   <button
                     type="button"
                     onClick={() => handleDeletePhoto(index)}
                     className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                     aria-label={`Delete photo ${index + 1}`}
                   >
                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 )}
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-[#286B88] text-white px-2 py-1 rounded text-xs">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />



        {/* Helper text */}
        <p className="text-xs text-gray-500">
          Maximum {maxPhotos} photos. Upload files (under 5MB) or add images from URLs. Supported formats: JPG, PNG, GIF, WebP.
          {photos.length > 0 && ' The first photo will be used as the main image on the map.'} Click ✕ to remove photos.
        </p>
      </div>
    </div>
  );
} 