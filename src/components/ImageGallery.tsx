'use client';

import { useState } from 'react';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { Eye } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  selectedImage: string | null;
  onImageSelect: (imageName: string) => void;
}

export default function ImageGallery({ images, selectedImage, onImageSelect }: ImageGalleryProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const imageData = images.map(image => ({
    src: `/generated_images/${image}`,
    alt: `Generated image: ${image}`,
    title: image
  }));

  const openViewer = (imageName: string) => {
    const index = images.findIndex(img => img === imageName);
    if (index !== -1) {
      setViewerIndex(index);
      setViewerOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Images</h2>
      
      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No images generated yet</p>
          <p className="text-sm">Use the tabs above to generate or chat with the AI!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === image
                  ? 'border-blue-500 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => openViewer(image)}
            >
              <img
                src={`/generated_images/${image}`}
                alt="Generated image"
                className="w-full h-32 sm:h-40 object-cover"
              />
              
              {/* Overlay with action buttons */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pointer-events-auto">
                  <button
                    className="px-2 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewer(image);
                    }}
                    title="View image"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedImage === image
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageSelect(image);
                    }}
                  >
                    {selectedImage === image ? '✓' : 'Select'}
                  </button>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedImage === image && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  ✓
                </div>
              )}
              
              {/* Image filename */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {image}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={imageData}
        currentIndex={viewerIndex}
        onCurrentIndexChange={setViewerIndex}
      />
    </div>
  );
}