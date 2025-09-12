import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedImages } from '@/lib/getImages';
import { buildTreeFromImages, ImageNode } from '@/lib/treeUtils';
import { readFile, writeFile, access } from 'fs/promises';
import path from 'path';

const treeFile = path.join(process.cwd(), 'public', 'tree.json');

export async function GET() {
  try {
    try {
      await access(treeFile);
      const data = await readFile(treeFile, 'utf-8');
      const tree: ImageNode[] = JSON.parse(data);
      return NextResponse.json({ tree });
    } catch (error) {
      const noFileError = error as NodeJS.ErrnoException;
      if (noFileError.code === 'ENOENT') {
        const images = await getGeneratedImages();
        const tree = buildTreeFromImages(images);
        await writeFile(treeFile, JSON.stringify(tree, null, 2), 'utf-8');
        return NextResponse.json({ tree });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error handling GET /api/tree:', error);
    return NextResponse.json({ error: 'Failed to retrieve tree' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tree } = body;
    if (!Array.isArray(tree) || tree.some((node: unknown) => typeof node !== 'object' || !node || !('id' in node) || !('children' in node) || !Array.isArray((node as { children: unknown }).children))) {
      return NextResponse.json({ error: 'Invalid tree structure' }, { status: 400 });
    }
    await writeFile(treeFile, JSON.stringify(tree, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling POST /api/tree:', error);
    return NextResponse.json({ error: 'Failed to save tree' }, { status: 500 });
  }
}