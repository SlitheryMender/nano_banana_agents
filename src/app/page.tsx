'use client';

import { useState, useEffect } from 'react';
import { TreeProvider } from '@/lib/TreeContext';
import ChatTab from '@/components/ChatTab';
import GenerateTab from '@/components/GenerateTab';
import EditTab from '@/components/EditTab';
import ThemifyTab from '@/components/ThemifyTab';
import MergeTab from '@/components/MergeTab';
import TreeTab from '@/components/TreeTab';
import ImageGallery from '@/components/ImageGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'generate' | 'edit' | 'themify' | 'merge' | 'tree'>('chat');
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/images-list');
      if (response.ok) {
        const imageList = await response.json();
        setImages(imageList);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const showStatus = (message: string, type: 'success' | 'error' | 'loading') => {
    setStatus({ message, type });
  };

  const hideStatus = () => {
    setStatus(null);
  };

  const onImagesGenerated = (newImages: string[]) => {
    setImages(prev => [...newImages, ...prev]);
    loadImages(); // Refresh the full list
  };

  const onImageSelect = (imageName: string) => {
    setSelectedImage(selectedImage === imageName ? null : imageName);
    if (activeTab !== 'edit' && activeTab !== 'chat' && activeTab !== 'themify' && activeTab !== 'merge') {
      setActiveTab('edit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍌 Nano Banana Agent</h1>
          <p className="text-gray-600">AI-powered image generation and editing with conversational interface</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <TreeProvider>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => { setActiveTab('chat'); hideStatus(); }}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => { setActiveTab('generate'); hideStatus(); }}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'generate'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎨 Generate
            </button>
            <button
              onClick={() => { setActiveTab('edit'); hideStatus(); }}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'edit'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🖼️ Edit
            </button>
            <button
              onClick={() => { setActiveTab('themify'); hideStatus(); }}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'themify'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎭 Themify
            </button>
            <button
              onClick={() => { setActiveTab('merge'); hideStatus(); }}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'merge'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔗 Merge
            </button>
            <button
              onClick={() => { setActiveTab('tree'); hideStatus(); }}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'tree'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🌳 Tree View
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {activeTab === 'chat' && (
              <ChatTab 
                selectedImage={selectedImage}
                onImagesGenerated={onImagesGenerated}
                showStatus={showStatus}
              />
            )}
            {activeTab === 'generate' && (
              <GenerateTab 
                onImagesGenerated={onImagesGenerated}
                showStatus={showStatus}
                hideStatus={hideStatus}
              />
            )}
            {activeTab === 'edit' && (
              <EditTab 
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onImagesGenerated={onImagesGenerated}
                showStatus={showStatus}
                hideStatus={hideStatus}
              />
            )}
            {activeTab === 'themify' && (
              <ThemifyTab 
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onImagesGenerated={onImagesGenerated}
                showStatus={showStatus}
                hideStatus={hideStatus}
              />
            )}
            {activeTab === 'merge' && (
              <MergeTab 
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onImagesGenerated={onImagesGenerated}
                showStatus={showStatus}
                hideStatus={hideStatus}
                images={images}
              />
            )}
            {activeTab === 'tree' && (
              <TreeTab
                images={images}
                selectedImage={selectedImage}
                onImageSelect={onImageSelect}
              />
            )}

            {/* Status Display */}
            {status && (
              <div className={`mt-4 p-4 rounded-md ${
                status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {status.type === 'loading' && (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    {status.message}
                  </div>
                )}
                {status.type !== 'loading' && status.message}
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <ImageGallery 
            images={images}
            selectedImage={selectedImage}
            onImageSelect={onImageSelect}
          />
          </TreeProvider>
        </div>
    </div>
    </div>
  );
}