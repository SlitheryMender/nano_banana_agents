import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function getGeneratedImages(): Promise<string[]> {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'generated_images');
    const files = await readdir(imagesDir);
    
    // Filter for image files and get their stats for sorting
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
    );
    
    // Get file stats and sort by modification time (newest first)
    const filesWithStats = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(imagesDir, file);
        const stats = await stat(filePath);
        return { file, mtime: stats.mtime };
      })
    );
    
    return filesWithStats
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      .map(item => item.file);
  } catch (error) {
    console.error('Error reading generated images:', error);
    return [];
  }
}