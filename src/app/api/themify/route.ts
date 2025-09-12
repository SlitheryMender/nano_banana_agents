import { NextRequest, NextResponse } from 'next/server';
import { themifyPhoto } from '@/lib/imageGeneration';
import { parseFormData, saveUploadedFile } from '@/lib/fileUpload';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { file, selectedImage, customPrompt } = await parseFormData(request);
    const themePrompt = customPrompt || 'apply a beautiful artistic theme transformation';
    
    if (!file && !selectedImage) {
      return NextResponse.json({ error: 'No image selected for themifying' }, { status: 400 });
    }

    let imagePath: string;
    
    if (file && file.size > 0) {
      // Save uploaded file
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = await saveUploadedFile(file, uploadsDir);
      imagePath = path.join(uploadsDir, filename);
    } else if (selectedImage) {
      // Use selected existing image
      imagePath = path.join(process.cwd(), 'public', 'generated_images', selectedImage);
      if (!fs.existsSync(imagePath)) {
        return NextResponse.json({ error: 'Selected image not found' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'No valid image source' }, { status: 400 });
    }

    // Apply theme to image
    const result = await themifyPhoto(themePrompt, imagePath);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to themify image' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: result.files,
      count: result.count,
      theme: themePrompt
    });
  } catch (error) {
    console.error('Themify API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}