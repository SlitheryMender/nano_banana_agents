import { NextRequest, NextResponse } from 'next/server';
import { generateImagesParallel } from '@/lib/imageGeneration';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateImagesParallel(prompt.trim());
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate images' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: result.files,
      count: result.count
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}