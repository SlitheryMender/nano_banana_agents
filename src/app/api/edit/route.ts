import { NextRequest, NextResponse } from 'next/server';
import { generateImagesParallel, EDITING_PRESETS } from '@/lib/imageGeneration';
import { parseFormData, saveUploadedFile } from '@/lib/fileUpload';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { file, selectedImage, preset, customPrompt } = await parseFormData(request);
    
    if (!file && !selectedImage) {
      return NextResponse.json({ error: 'No file selected' }, { status: 400 });
    }

    let uploadPath: string;
    
    if (file && file.size > 0) {
      // Save uploaded file
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = await saveUploadedFile(file, uploadsDir);
      uploadPath = path.join(uploadsDir, filename);
    } else if (selectedImage) {
      // Use selected existing image
      uploadPath = path.join(process.cwd(), 'public', 'generated_images', selectedImage);
      if (!fs.existsSync(uploadPath)) {
        return NextResponse.json({ error: 'Selected image not found' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'No valid image source' }, { status: 400 });
    }

    // Create editing prompt
    const baseInstruction = EDITING_PRESETS[preset as keyof typeof EDITING_PRESETS] || EDITING_PRESETS.enhance;
    const editPrompt = customPrompt 
      ? `${customPrompt}, ${baseInstruction}`
      : baseInstruction;

    // Generate edited images
    const result = await generateImagesParallel(editPrompt, uploadPath);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to edit image' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: result.files,
      count: result.count
    });
  } catch (error) {
    console.error('Edit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}