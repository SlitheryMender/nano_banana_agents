'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ImageNode, getNumFromFilename } from '@/lib/treeUtils';

interface TreeContextType {
  treeData: ImageNode[];
  addChildren: (parentId: string, newImages: string[], type: ImageNode['type'], prompt: string) => void;
  addNewRoots: (newImages: string[], type: ImageNode['type'], prompt: string) => void;
  toggleExpanded: (nodeId: string) => void;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

interface TreeProviderProps {
  children: ReactNode;
}

export function TreeProvider({ children }: TreeProviderProps) {
  const [treeData, setTreeData] = useState<ImageNode[]>([]);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetch('/api/tree', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setTreeData(data.tree || []);
        }
      } catch (error) {
        console.error('Error fetching tree:', error);
      }
    };
    fetchTree();
  }, []);

  const save = async () => {
    try {
      await fetch('/api/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tree: treeData })
      });
    } catch (error) {
      console.error('Error saving tree:', error);
    }
  };

  const updateTree = (tree: ImageNode[], parentId: string, newChildren: ImageNode[]): ImageNode[] => {
    return tree.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, ...newChildren],
          expanded: true
        };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: updateTree(node.children, parentId, newChildren)
        };
      }
      return node;
    });
  };

  const addChildren = (parentId: string, newImages: string[], type: ImageNode['type'], prompt: string) => {
    const newNodes: ImageNode[] = newImages.map(image => ({
      id: image,
      url: `/generated_images/${image}`,
      parentId,
      children: [],
      type,
      prompt,
      expanded: false
    }));

    const updatedTree = updateTree(treeData, parentId, newNodes);
    setTreeData(updatedTree);
    save();
  };

  const addNewRoots = (newImages: string[], type: ImageNode['type'], prompt: string) => {
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

    setTreeData(prev => [...prev, root].sort((a, b) => a.id.localeCompare(b.id)));
    save();
  };

  const toggleExpanded = (nodeId: string) => {
    const updateTree = (nodes: ImageNode[]): ImageNode[] => nodes.map(node => {
      if (node.id === nodeId) return { ...node, expanded: !node.expanded };
      if (node.children.length > 0) return { ...node, children: updateTree(node.children) };
      return node;
    });
    setTreeData(prev => updateTree(prev));
    save();
  };

  return (
    <TreeContext.Provider value={{ treeData, addChildren, addNewRoots, toggleExpanded }}>
      {children}
    </TreeContext.Provider>
  );
}

export const useTree = (): TreeContextType => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};