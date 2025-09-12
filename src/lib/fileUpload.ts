import { writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';
import path from 'path';

export async function saveUploadedFile(file: File, uploadDir: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  const filename = `${timestamp}_${file.name}`;
  const filepath = path.join(uploadDir, filename);
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  await writeFile(filepath, buffer);
  return filename;
}

export async function parseFormData(request: NextRequest): Promise<{
  file?: File;
  selectedImage?: string;
  preset?: string;
  customPrompt?: string;
}> {
  const formData = await request.formData();
  
  const file = formData.get('image') as File | null;
  const selectedImage = formData.get('selected_image') as string | null;
  const preset = formData.get('preset') as string | null;
  const customPrompt = formData.get('custom_prompt') as string | null;
  
  return {
    file: file || undefined,
    selectedImage: selectedImage || undefined,
    preset: preset || undefined,
    customPrompt: customPrompt || undefined
  };
}