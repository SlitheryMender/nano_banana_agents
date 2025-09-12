import { NextResponse } from 'next/server';
import { getGeneratedImages } from '@/lib/getImages';

export async function GET() {
  try {
    const images = await getGeneratedImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images list:', error);
    return NextResponse.json([], { status: 500 });
  }
}