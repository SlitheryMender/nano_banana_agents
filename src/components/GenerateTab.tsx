'use client';

import { useState } from 'react';
import { useTreeStore } from '@/lib/treeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GenerateTabProps {
  onImagesGenerated: (images: string[]) => void;
  showStatus: (message: string, type: 'success' | 'error' | 'loading') => void;
  hideStatus: () => void;
}

export default function GenerateTab({ onImagesGenerated, showStatus, hideStatus }: GenerateTabProps) {
  const [prompt, setPrompt] = useState('Generate a simple image of a banana on a white background');
  const [isLoading, setIsLoading] = useState(false);
  const { addNewRoots } = useTreeStore();

  const generateImages = async () => {
    if (!prompt.trim()) {
      showStatus('Please enter a prompt', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Generating 4 images... This may take a minute.', 'loading');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      const data = await response.json();

      if (data.success) {
        showStatus(`Successfully generated ${data.count}/4 images!`, 'success');
        onImagesGenerated(data.images);
        const treePrompt = prompt.trim();
        addNewRoots(data.images, 'original', treePrompt);
      } else {
        showStatus(data.error || 'Failed to generate images', 'error');
      }
    } catch (error) {
      showStatus('Error connecting to server', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      generateImages();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">
          Enter your image prompt:
        </Label>
        <Input
          id="prompt"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && generateImages()}
          placeholder="e.g., A cat wearing sunglasses sitting on a beach"
          disabled={isLoading}
        />
      </div>
      
      <Button
        onClick={generateImages}
        disabled={isLoading}
        className="w-full h-12"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating...
          </div>
        ) : (
          'Generate 4 Images'
        )}
      </Button>
    </div>
  );
}