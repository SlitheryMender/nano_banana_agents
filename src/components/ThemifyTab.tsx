'use client';

import { useState, useRef } from 'react';

interface ThemifyTabProps {
  selectedImage: string | null;
  onImageSelect: (image: string | null) => void;
  onImagesGenerated: (images: string[]) => void;
  showStatus: (message: string, type: 'success' | 'error' | 'loading') => void;
  hideStatus: () => void;
}

const THEME_PRESETS = {
  cyberpunk: '🤖 Cyberpunk - neon lights, futuristic cityscape, dark atmosphere',
  fantasy: '🧙 Fantasy - magical elements, mystical creatures, enchanted forest',
  retro: '📺 Retro - vintage 80s aesthetic, synthwave colors, nostalgic vibes',
  horror: '👻 Horror - dark, spooky, gothic elements, eerie atmosphere',
  watercolor: '🎨 Watercolor - soft, flowing paint effects, artistic blending',
  comic: '💥 Comic Book - bold outlines, vibrant colors, superhero style',
  steampunk: '⚙️ Steampunk - Victorian era meets technology, brass and gears',
  minimalist: '⚪ Minimalist - clean, simple, geometric shapes, modern aesthetic'
};

export default function ThemifyTab({ 
  selectedImage, 
  onImageSelect, 
  onImagesGenerated, 
  showStatus, 
  hideStatus 
}: ThemifyTabProps) {
  const [themePreset, setThemePreset] = useState<string>('cyberpunk');
  const [customTheme, setCustomTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themifyImage = async () => {
    const file = fileInputRef.current?.files?.[0];
    
    if (!file && !selectedImage) {
      showStatus('Please upload an image or select one from the gallery', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Applying theme transformation... This may take a minute.', 'loading');

    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('image', file);
      } else if (selectedImage) {
        formData.append('selected_image', selectedImage);
      }
      
      // Use custom theme if provided, otherwise use preset
      const themePrompt = customTheme.trim() || THEME_PRESETS[themePreset as keyof typeof THEME_PRESETS];
      formData.append('custom_prompt', themePrompt);

      const response = await fetch('/api/themify', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showStatus(`Successfully created ${data.count}/4 themed variations!`, 'success');
        onImagesGenerated(data.images);
        
        // Reset form
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setCustomTheme('');
      } else {
        showStatus(data.error || 'Failed to themify image', 'error');
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={`/generated_images/${selectedImage}`} 
                alt="Selected" 
                className="w-16 h-16 object-cover rounded-lg mr-3"
              />
              <span className="text-sm text-purple-800">Selected: {selectedImage}</span>
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

      {/* Theme Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="themePreset" className="block text-sm font-medium text-gray-700 mb-2">
            Theme Preset:
          </label>
          <select
            id="themePreset"
            value={themePreset}
            onChange={(e) => setThemePreset(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            disabled={isLoading}
          >
            {Object.entries(THEME_PRESETS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="customTheme" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Theme (overrides preset):
          </label>
          <input
            id="customTheme"
            type="text"
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
            placeholder="e.g., Victorian era mansion at sunset"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Preview of selected theme */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          <strong>Active Theme:</strong> {customTheme.trim() || THEME_PRESETS[themePreset as keyof typeof THEME_PRESETS]}
        </p>
      </div>

      <button
        onClick={themifyImage}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Themifying...
          </div>
        ) : (
          '🎨 Apply Theme & Create 4 Variations'
        )}
      </button>
    </div>
  );
}