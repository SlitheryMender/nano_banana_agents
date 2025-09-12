'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditTabProps {
  selectedImage: string | null;
  onImageSelect: (image: string | null) => void;
  onImagesGenerated: (images: string[]) => void;
  showStatus: (message: string, type: 'success' | 'error' | 'loading') => void;
  hideStatus: () => void;
}

const EDITING_PRESETS = {
  enhance: '✨ Enhance Quality',
  artistic: '🎨 Artistic Style',
  vintage: '📸 Vintage Filter',
  black_white: '⚫ Black & White',
  blur: '💫 Artistic Blur',
  cartoon: '🎭 Cartoon Style'
};

export default function EditTab({ 
  selectedImage, 
  onImageSelect, 
  onImagesGenerated, 
  showStatus, 
  hideStatus 
}: EditTabProps) {
  const [preset, setPreset] = useState<string>('enhance');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editImage = async () => {
    const file = fileInputRef.current?.files?.[0];
    
    if (!file && !selectedImage) {
      showStatus('Please upload an image or select one from the gallery', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Editing image and creating 4 variations... This may take a minute.', 'loading');

    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('image', file);
      } else if (selectedImage) {
        formData.append('selected_image', selectedImage);
      }
      
      formData.append('preset', preset);
      if (customPrompt.trim()) {
        formData.append('custom_prompt', customPrompt.trim());
      }

      const response = await fetch('/api/edit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showStatus(`Successfully created ${data.count}/4 image variations!`, 'success');
        onImagesGenerated(data.images);
        
        // Reset form
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setCustomPrompt('');
      } else {
        showStatus(data.error || 'Failed to edit image', 'error');
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
      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image OR select from gallery below:
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={`/generated_images/${selectedImage}`} 
                alt="Selected" 
                className="w-16 h-16 object-cover rounded-lg mr-3"
              />
              <span className="text-sm text-blue-800">Selected: {selectedImage}</span>
            </div>
            <button
              onClick={() => onImageSelect(null)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Editing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preset">
            Edit Style:
          </Label>
          <Select
            value={preset}
            onValueChange={setPreset}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select editing style" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EDITING_PRESETS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customPrompt">
            Custom Instructions (optional):
          </Label>
          <Input
            id="customPrompt"
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., make it more colorful, add dramatic lighting"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        onClick={editImage}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Editing...
          </div>
        ) : (
          'Edit & Create 4 Variations'
        )}
      </button>
    </div>
  );
}