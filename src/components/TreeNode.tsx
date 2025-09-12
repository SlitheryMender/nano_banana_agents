'use client';

import { ImageNode } from '@/lib/treeUtils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { Eye } from 'lucide-react';

const EDITING_PRESETS = {
  enhance: '✨ Enhance Quality',
  artistic: '🎨 Artistic Style',
  vintage: '📸 Vintage Filter',
  black_white: '⚫ Black & White',
  blur: '💫 Artistic Blur',
  cartoon: '🎭 Cartoon Style'
} as const;

const THEME_PRESETS = {
  cyberpunk: '🤖 Cyberpunk - neon lights, futuristic cityscape, dark atmosphere',
  fantasy: '🧙 Fantasy - magical elements, mystical creatures, enchanted forest',
  retro: '📺 Retro - vintage 80s aesthetic, synthwave colors, nostalgic vibes',
  horror: '👻 Horror - dark, spooky, gothic elements, eerie atmosphere',
  watercolor: '🎨 Watercolor - soft, flowing paint effects, artistic blending',
  comic: '💥 Comic Book - bold outlines, vibrant colors, superhero style',
  steampunk: '⚙️ Steampunk - Victorian era meets technology, brass and gears',
  minimalist: '⚪ Minimalist - clean, simple, geometric shapes, modern aesthetic'
} as const;

interface TreeNodeProps {
  node: ImageNode;
  level: number;
  selectedImage: string | null;
  onImageSelect: (imageName: string) => void;
  onEdit: (nodeId: string, prompt: string) => void;
  onThemify: (nodeId: string, prompt: string) => void;
  loading: { [key: string]: boolean };
  expanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
}

type ModalType = 'edit' | 'themify' | null;

export default function TreeNode({
  node,
  level,
  selectedImage,
  onImageSelect,
  onEdit,
  onThemify,
  loading,
  expanded,
  onToggleExpanded,
}: TreeNodeProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [prompt, setPrompt] = useState('');
  const [editPreset, setEditPreset] = useState('enhance');
  const [themifyPreset, setThemifyPreset] = useState('cyberpunk');
  const [viewerOpen, setViewerOpen] = useState(false);

  const isLoading = loading[node.id];
  const isSelected = selectedImage === node.id;
  const hasChildren = node.children.length > 0;

  const openModal = (type: 'edit' | 'themify') => {
    setModalType(type);
    if (type === 'edit') {
      setEditPreset('enhance');
    } else if (type === 'themify') {
      setThemifyPreset('cyberpunk');
    }
    setPrompt('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setPrompt('');
  };

  const handleSubmit = () => {
    if (modalType === 'edit') {
      onEdit(node.id, prompt);
    } else if (modalType === 'themify') {
      onThemify(node.id, prompt);
    }
    closeModal();
  };

  const openViewer = () => {
    setViewerOpen(true);
  };

  return (
    <div className="select-none">
      {/* Node content */}
      <div
        className={`flex items-center py-2 px-2 rounded-lg mb-1 cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'
        }`}
        style={{ marginLeft: `${level * 16}px` }} // ml-4 equivalent: 16px per level
        onClick={() => onImageSelect(node.id)}
      >
        {/* Expand/collapse chevron */}
        {(hasChildren || isLoading) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoading) onToggleExpanded(node.id);
            }}
            className="w-6 h-6 flex items-center justify-center mr-2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : expanded ? (
              <span className="text-xs">▼</span> // Chevron down
            ) : (
              <span className="text-xs">▶</span> // Chevron right
            )}
          </button>
        )}
        {!hasChildren && !isLoading && <div className="w-6 h-6 mr-2"></div>}

        {/* Image preview - integrate ImageGallery style */}
        <img
          src={node.url}
          alt={node.id}
          className="w-12 h-12 object-cover rounded border mr-3" // Matches ImageGallery thumbnail
        />

        {/* Node info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{node.id}</p>
          {node.type !== 'original' && node.prompt && (
            <p className="text-xs text-gray-500 truncate">
              {node.type}: {node.prompt}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openViewer();
            }}
            disabled={isLoading}
            className="h-7 px-1 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openModal('edit');
            }}
            disabled={isLoading}
            className="h-7 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openModal('themify');
            }}
            disabled={isLoading}
            className="h-7 px-2 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            Themify
          </Button>
        </div>
      </div>

      {/* Children - recursive */}
      {hasChildren && expanded && (
        <div className="ml-4 border-l-2 border-gray-200 pl-1"> {/* Indentation */}
          {node.children.map((child: ImageNode) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedImage={selectedImage}
              onImageSelect={onImageSelect}
              onEdit={onEdit}
              onThemify={onThemify}
              loading={loading}
              expanded={child.expanded || false}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === 'edit' ? 'Edit Image' : 'Themify Image'}
            </h3>
            {modalType === 'edit' && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="editPreset">Preset:</Label>
                <Select
                  value={editPreset}
                  onValueChange={(value) => {
                    setEditPreset(value);
                    setPrompt(EDITING_PRESETS[value as keyof typeof EDITING_PRESETS]);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select editing preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EDITING_PRESETS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {modalType === 'themify' && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="themifyPreset">Preset:</Label>
                <Select
                  value={themifyPreset}
                  onValueChange={(value) => {
                    setThemifyPreset(value);
                    setPrompt(THEME_PRESETS[value as keyof typeof THEME_PRESETS]);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(THEME_PRESETS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                modalType === 'edit'
                  ? 'e.g., enhance quality, make it more artistic'
                  : 'e.g., cyberpunk with neon lights'
              }
              className="resize-none h-32"
              disabled={isLoading}
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? 'Processing...' : 'Generate Variations'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={[{
          src: node.url,
          alt: `Generated image: ${node.id}`,
          title: node.id
        }]}
        currentIndex={0}
        onCurrentIndexChange={() => {}}
      />
    </div>
  );
}