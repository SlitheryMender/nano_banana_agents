'use client';

import { useState, useEffect } from 'react';
import TreeNode from './TreeNode';
import { useTreeStore } from '@/lib/treeStore';

interface TreeTabProps {
  images: string[];
  selectedImage: string | null;
  onImageSelect: (imageName: string) => void;
}

interface StatusMessage {
  message: string;
  type: 'success' | 'error';
}

export default function TreeTab({ images, selectedImage, onImageSelect }: TreeTabProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  
  const { 
    treeData, 
    loadTreeFromServer, 
    addChildren, 
    toggleExpanded 
  } = useTreeStore();

  // Load tree data on component mount
  useEffect(() => {
    loadTreeFromServer();
  }, [loadTreeFromServer]);

  // Clear status after 5 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleEdit = async (nodeId: string, prompt: string = '') => {
    setLoading(prev => ({ ...prev, [nodeId]: true }));
    
    try {
      const formData = new FormData();
      formData.append('selected_image', nodeId);
      formData.append('preset', 'enhance');
      if (prompt.trim()) {
        formData.append('custom_prompt', prompt.trim());
      }

      const response = await fetch('/api/edit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && (result.images || result.files)) {
        const newImages = result.images || result.files;
        // Add children to the tree
        addChildren(nodeId, newImages, 'edit', prompt.trim() || 'Edit');
        setStatus({ message: `Successfully added ${newImages.length} edit variations!`, type: 'success' });
      } else {
        setStatus({ message: result.error || 'Failed to edit image', type: 'error' });
      }
    } catch (error) {
      console.error('Edit failed:', error);
      setStatus({ message: 'Error connecting to server', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  const handleThemify = async (nodeId: string, prompt: string = '') => {
    setLoading(prev => ({ ...prev, [nodeId]: true }));
    
    try {
      const formData = new FormData();
      formData.append('selected_image', nodeId);
      const themePrompt = prompt.trim() || 'Apply cyberpunk theme with neon lights and futuristic elements';
      formData.append('custom_prompt', themePrompt);

      const response = await fetch('/api/themify', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && (result.images || result.files)) {
        const newImages = result.images || result.files;
        // Add children to the tree
        addChildren(nodeId, newImages, 'themify', themePrompt);
        setStatus({ message: `Successfully added ${newImages.length} themify variations!`, type: 'success' });
      } else {
        setStatus({ message: result.error || 'Failed to themify image', type: 'error' });
      }
    } catch (error) {
      console.error('Themify failed:', error);
      setStatus({ message: 'Error connecting to server', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Image Tree View</h2>
      
      {treeData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No images generated yet</p>
          <p className="text-sm">Generate some images first to see the tree structure!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Status Message */}
          {status && (
            <div className={`p-3 rounded-lg mb-4 ${
              status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {status.message}
            </div>
          )}
          
          <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
            <p><strong>Tree View Instructions:</strong></p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Click any image to select it</li>
              <li>• Use <span className="bg-green-100 px-1 rounded">Edit</span> or <span className="bg-purple-100 px-1 rounded">Themify</span> buttons to generate child variations</li>
              <li>• Click ▶/▼ to expand/collapse branches</li>
              <li>• Child images show their relationship and operation used</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            {treeData.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                selectedImage={selectedImage}
                onImageSelect={onImageSelect}
                onEdit={handleEdit}
                onThemify={handleThemify}
                loading={loading}
                expanded={node.expanded}
                onToggleExpanded={toggleExpanded}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}