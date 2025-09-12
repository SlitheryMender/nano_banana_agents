import { NextRequest, NextResponse } from 'next/server';
import { mergeMultipleImages } from '@/lib/imageGeneration';
import { parseFormData, saveUploadedFile } from '@/lib/fileUpload';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file1 = formData.get('image1') as File | null;
    const file2 = formData.get('image2') as File | null;
    const selectedImage1 = formData.get('selected_image1') as string | null;
    const selectedImage2 = formData.get('selected_image2') as string | null;
    const customPrompt = formData.get('custom_prompt') as string | null;
    
    const mergePrompt = customPrompt || 'creatively merge and blend these images together';
    
    // Need at least two images to merge
    if ((!file1 && !selectedImage1) || (!file2 && !selectedImage2)) {
      return NextResponse.json({ 
        error: 'Two images are required for merging' 
      }, { status: 400 });
    }

    let image1Path: string;
    let image2Path: string;
    
    // Process first image
    if (file1 && file1.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = await saveUploadedFile(file1, uploadsDir);
      image1Path = path.join(uploadsDir, filename);
    } else if (selectedImage1) {
      image1Path = path.join(process.cwd(), 'public', 'generated_images', selectedImage1);
      if (!fs.existsSync(image1Path)) {
        return NextResponse.json({ error: 'First selected image not found' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'First image not provided' }, { status: 400 });
    }
    
    // Process second image
    if (file2 && file2.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = await saveUploadedFile(file2, uploadsDir);
      image2Path = path.join(uploadsDir, filename);
    } else if (selectedImage2) {
      image2Path = path.join(process.cwd(), 'public', 'generated_images', selectedImage2);
      if (!fs.existsSync(image2Path)) {
        return NextResponse.json({ error: 'Second selected image not found' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Second image not provided' }, { status: 400 });
    }

    // Merge the images
    const result = await mergeMultipleImages(mergePrompt, image1Path, image2Path);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to merge images' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: result.files,
      count: result.count,
      mergePrompt: mergePrompt
    });
  } catch (error) {
    console.error('Merge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}