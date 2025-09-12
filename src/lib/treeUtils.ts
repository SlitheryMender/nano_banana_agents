export interface ImageNode {
  id: string;
  url: string;
  parentId?: string;
  children: ImageNode[];
  type: 'original' | 'edit' | 'themify';
  prompt?: string;
  expanded: boolean;
}

export const buildTreeFromImages = (imgList: string[]): ImageNode[] => {
  const groupMap = new Map<string, (ImageNode & { sortNum?: number })[]>();

  // Group images by their base name (everything before the final _N.ext)
  imgList.forEach((filename) => {
    const id = filename;
    const url = `/generated_images/${id}`;
    
    // Extract base pattern and number
    const match = filename.match(/^(.+)_(\d+)\.(png|jpg)$/i);
    if (!match) {
      // If filename doesn't match pattern, treat as standalone root
      const node: ImageNode = {
        id,
        url,
        children: [],
        type: 'original',
        prompt: undefined,
        expanded: false,
      };
      groupMap.set(filename, [node]);
      return;
    }

    const [, base, numStr] = match;
    const num = parseInt(numStr, 10);

    const node: ImageNode = {
      id,
      url,
      children: [],
      type: 'original',
      prompt: undefined,
      expanded: false,
    };

    // Group by base name
    const existingNodes = groupMap.get(base) || [];
    existingNodes.push({ ...node, sortNum: num });
    groupMap.set(base, existingNodes);
  });

  // Convert groups to tree structures
  const roots: ImageNode[] = [];
  
  groupMap.forEach((nodes, base) => {
    // Sort nodes by their number
    const sortedNodes = nodes.sort((a, b) => (a.sortNum || 0) - (b.sortNum || 0));
    
    if (sortedNodes.length === 1) {
      // Single image becomes a root
      const node = { ...sortedNodes[0] };
      delete node.sortNum;
      roots.push(node);
    } else if (sortedNodes.length > 1) {
      // Multiple images: first becomes root, rest become children
      const root = { ...sortedNodes[0], expanded: true };
      delete root.sortNum;
      
      const children = sortedNodes.slice(1).map(node => {
        const child = { ...node };
        delete child.sortNum;
        child.parentId = root.id;
        return child;
      });
      
      root.children = children;
      roots.push(root);
    }
  });

  // Sort roots by ID for consistent display
  return roots.sort((a, b) => a.id.localeCompare(b.id));
};

export function getNumFromFilename(filename: string): number {
  const match = filename.match(/(\d+)\.(png|jpg)$/i);
  return match ? parseInt(match[1], 10) : 0;
}