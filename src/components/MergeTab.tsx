'use client';

import { useState, useRef } from 'react';

interface MergeTabProps {
  selectedImage: string | null;
  onImageSelect: (image: string | null) => void;
  onImagesGenerated: (images: string[]) => void;
  showStatus: (message: string, type: 'success' | 'error' | 'loading') => void;
  hideStatus: () => void;
  images: string[];
}

const MERGE_STYLES = {
  blend: '🌈 Seamless Blend - smooth transition between images',
  collage: '🖼️ Artistic Collage - creative composition and layout',
  overlay: '🌟 Overlay Fusion - layer images with transparency effects',
  side_by_side: '↔️ Side by Side - compare and contrast arrangement',
  mosaic: '🔲 Mosaic Style - tile-like artistic arrangement',
  double_exposure: '📸 Double Exposure - ethereal overlay effect',
  split_screen: '⚡ Split Screen - dynamic division and merge',
  morph: '🔄 Morphing Transition - gradual transformation between images'
};

export default function MergeTab({ 
  selectedImage, 
  onImageSelect, 
  onImagesGenerated, 
  showStatus, 
  hideStatus,
  images
}: MergeTabProps) {
  const [mergeStyle, setMergeStyle] = useState<string>('blend');
  const [customMergePrompt, setCustomMergePrompt] = useState('');
  const [selectedImage1, setSelectedImage1] = useState<string | null>(null);
  const [selectedImage2, setSelectedImage2] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const file1InputRef = useRef<HTMLInputElement>(null);
  const file2InputRef = useRef<HTMLInputElement>(null);

  const mergeImages = async () => {
    const file1 = file1InputRef.current?.files?.[0];
    const file2 = file2InputRef.current?.files?.[0];
    
    if ((!file1 && !selectedImage1) || (!file2 && !selectedImage2)) {
      showStatus('Please provide two images - either upload files or select from gallery', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Merging images and creating variations... This may take a minute.', 'loading');

    try {
      const formData = new FormData();
      
      if (file1) {
        formData.append('image1', file1);
      } else if (selectedImage1) {
        formData.append('selected_image1', selectedImage1);
      }
      
      if (file2) {
        formData.append('image2', file2);
      } else if (selectedImage2) {
        formData.append('selected_image2', selectedImage2);
      }
      
      // Use custom prompt if provided, otherwise use style preset
      const mergePrompt = customMergePrompt.trim() || MERGE_STYLES[mergeStyle as keyof typeof MERGE_STYLES];
      formData.append('custom_prompt', mergePrompt);

      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showStatus(`Successfully created ${data.count}/4 merged variations!`, 'success');
        onImagesGenerated(data.images);
        
        // Reset form
        if (file1InputRef.current) file1InputRef.current.value = '';
        if (file2InputRef.current) file2InputRef.current.value = '';
        setCustomMergePrompt('');
      } else {
        showStatus(data.error || 'Failed to merge images', 'error');
      }
    } catch (error) {
      showStatus('Error connecting to server', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Image */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-3">First Image</h3>
          <input
            ref={file1InputRef}
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
            disabled={isLoading}
          />
          
          {selectedImage1 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={`/generated_images/${selectedImage1}`} 
                    alt="Selected 1" 
                    className="w-12 h-12 object-cover rounded mr-2"
                  />
                  <span className="text-xs text-orange-800">{selectedImage1}</span>
                </div>
                <button
                  onClick={() => setSelectedImage1(null)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="max-h-32 overflow-y-auto">
            <p className="text-xs text-gray-600 mb-2">Select from gallery:</p>
            <div className="grid grid-cols-4 gap-1">
              {images.map((image) => (
                <img
                  key={`merge1-${image}`}
                  src={`/generated_images/${image}`}
                  alt={image}
                  className={`w-12 h-12 object-cover rounded cursor-pointer border-2 transition-all ${
                    selectedImage1 === image ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImage1(selectedImage1 === image ? null : image)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Second Image */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-3">Second Image</h3>
          <input
            ref={file2InputRef}
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            disabled={isLoading}
          />
          
          {selectedImage2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={`/generated_images/${selectedImage2}`} 
                    alt="Selected 2" 
                    className="w-12 h-12 object-cover rounded mr-2"
                  />
                  <span className="text-xs text-blue-800">{selectedImage2}</span>
                </div>
                <button
                  onClick={() => setSelectedImage2(null)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="max-h-32 overflow-y-auto">
            <p className="text-xs text-gray-600 mb-2">Select from gallery:</p>
            <div className="grid grid-cols-4 gap-1">
              {images.map((image) => (
                <img
                  key={`merge2-${image}`}
                  src={`/generated_images/${image}`}
                  alt={image}
                  className={`w-12 h-12 object-cover rounded cursor-pointer border-2 transition-all ${
                    selectedImage2 === image ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImage2(selectedImage2 === image ? null : image)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Merge Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mergeStyle" className="block text-sm font-medium text-gray-700 mb-2">
            Merge Style:
          </label>
          <select
            id="mergeStyle"
            value={mergeStyle}
            onChange={(e) => setMergeStyle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {Object.entries(MERGE_STYLES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="customMergePrompt" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Merge Instructions (overrides preset):
          </label>
          <input
            id="customMergePrompt"
            type="text"
            value={customMergePrompt}
            onChange={(e) => setCustomMergePrompt(e.target.value)}
            placeholder="e.g., create a surreal dreamlike fusion"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Preview of selected merge style */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          <strong>Merge Style:</strong> {customMergePrompt.trim() || MERGE_STYLES[mergeStyle as keyof typeof MERGE_STYLES]}
        </p>
      </div>

      <button
        onClick={mergeImages}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Merging...
          </div>
        ) : (
          '🔗 Merge Images & Create 4 Variations'
        )}
      </button>
    </div>
  );
}