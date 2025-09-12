'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageNode, getNumFromFilename } from './treeUtils';

interface TreeStore {
  treeData: ImageNode[];
  loading: boolean;
  
  // Actions
  setTreeData: (data: ImageNode[]) => void;
  setLoading: (loading: boolean) => void;
  addChildren: (parentId: string, newImages: string[], type: ImageNode['type'], prompt: string) => void;
  addNewRoots: (newImages: string[], type: ImageNode['type'], prompt: string) => void;
  toggleExpanded: (nodeId: string) => void;
  saveTreeToServer: () => Promise<void>;
  loadTreeFromServer: () => Promise<void>;
}

export const useTreeStore = create<TreeStore>()(
  persist(
    (set, get) => ({
      treeData: [],
      loading: false,

      setTreeData: (data) => set({ treeData: data }),
      setLoading: (loading) => set({ loading }),

      saveTreeToServer: async () => {
        const { treeData } = get();
        try {
          await fetch('/api/tree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tree: treeData })
          });
        } catch (error) {
          console.error('Error saving tree to server:', error);
        }
      },

      loadTreeFromServer: async () => {
        set({ loading: true });
        try {
          const response = await fetch('/api/tree', { method: 'GET' });
          if (response.ok) {
            const data = await response.json();
            set({ treeData: data.tree || [] });
          }
        } catch (error) {
          console.error('Error loading tree from server:', error);
        } finally {
          set({ loading: false });
        }
      },

      addChildren: (parentId, newImages, type, prompt) => {
        const newNodes: ImageNode[] = newImages.map(image => ({
          id: image,
          url: `/generated_images/${image}`,
          parentId,
          children: [],
          type,
          prompt,
          expanded: false
        }));

        const updateTree = (tree: ImageNode[]): ImageNode[] => {
          return tree.map(node => {
            if (node.id === parentId) {
              return {
                ...node,
                children: [...node.children, ...newNodes],
                expanded: true
              };
            }
            if (node.children.length > 0) {
              return {
                ...node,
                children: updateTree(node.children)
              };
            }
            return node;
          });
        };

        set(state => ({
          treeData: updateTree(state.treeData)
        }));

        // Auto-save to server
        get().saveTreeToServer();
      },

      addNewRoots: (newImages, type, prompt) => {
        const sortedImages = [...newImages].sort((a, b) => getNumFromFilename(a) - getNumFromFilename(b));
        const rootId = sortedImages[0];
        const rootUrl = `/generated_images/${rootId}`;
        
        const root: ImageNode = {
          id: rootId,
          url: rootUrl,
          parentId: undefined,
          children: [],
          type,
          prompt,
          expanded: true
        };

        const childNodes: ImageNode[] = sortedImages.slice(1).map(image => ({
          id: image,
          url: `/generated_images/${image}`,
          parentId: rootId,
          children: [],
          type,
          prompt,
          expanded: false
        }));

        root.children = childNodes;

        set(state => ({
          treeData: [...state.treeData, root].sort((a, b) => a.id.localeCompare(b.id))
        }));

        // Auto-save to server
        get().saveTreeToServer();
      },

      toggleExpanded: (nodeId) => {
        const updateTree = (nodes: ImageNode[]): ImageNode[] => {
          return nodes.map(node => {
            if (node.id === nodeId) {
              return { ...node, expanded: !node.expanded };
            }
            if (node.children.length > 0) {
              return { ...node, children: updateTree(node.children) };
            }
            return node;
          });
        };

        set(state => ({
          treeData: updateTree(state.treeData)
        }));

        // Auto-save to server
        get().saveTreeToServer();
      },
    }),
    {
      name: 'tree-storage', // name of the item in localStorage
      partialize: (state) => ({ treeData: state.treeData }), // only persist treeData
    }
  )
);