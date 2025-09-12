import { NextRequest, NextResponse } from 'next/server';
import { generateImagesParallel, themifyPhoto, mergeMultipleImages } from '@/lib/imageGeneration';
import OpenAI from 'openai';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { message, selected_image } = await request.json();
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    // Check if user wants image generation/editing/themifying/merging
    const imageKeywords = ['generate', 'create', 'make', 'draw', 'image', 'picture', 'edit', 'modify', 'change'];
    const themifyKeywords = ['theme', 'themify', 'style', 'transform', 'apply theme', 'change style'];
    const mergeKeywords = ['merge', 'combine', 'blend', 'fuse', 'join', 'mix'];
    
    const wantsImage = imageKeywords.some(word => message.toLowerCase().includes(word));
    const wantsThemify = themifyKeywords.some(word => message.toLowerCase().includes(word));
    const wantsMerge = mergeKeywords.some(word => message.toLowerCase().includes(word));

    if (wantsThemify && selected_image) {
      // Themify mode - apply theme to selected image
      const systemMsg = `User wants to apply a theme to image '${selected_image}'. Extract theme instructions from their message.`;
      const response = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: message }
        ]
      });

      const themePrompt = response.choices[0].message.content || '';
      
      // Apply theme to image
      const inputPath = path.join(process.cwd(), 'public', 'generated_images', selected_image);
      const result = await themifyPhoto(themePrompt, inputPath);
      
      if (result.success) {
        return NextResponse.json({
          response: `I've applied the theme to your image: ${themePrompt}`,
          images: result.files,
          action: "generate"
        });
      } else {
        return NextResponse.json({
          response: `Sorry, I couldn't apply the theme: ${result.error}`,
          action: "chat"
        });
      }
    } else if (wantsMerge && selected_image) {
      return NextResponse.json({
        response: "I understand you want to merge images! Please select two images using the Merge tab, as I need two images to perform a merge operation.",
        action: "chat"
      });
    } else if (wantsImage || selected_image) {
      if (selected_image) {
        // Image editing mode
        const systemMsg = `User has selected an image '${selected_image}' and wants to edit it. Extract editing instructions from their message.`;
        const response = await client.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: message }
          ]
        });

        const editPrompt = response.choices[0].message.content || '';
        
        // Generate edited images
        const inputPath = path.join(process.cwd(), 'public', 'generated_images', selected_image);
        const result = await generateImagesParallel(editPrompt, inputPath);
        
        if (result.success) {
          return NextResponse.json({
            response: `I've edited your selected image with: ${editPrompt}`,
            images: result.files,
            action: "generate"
          });
        } else {
          return NextResponse.json({
            response: `Sorry, I couldn't edit the image: ${result.error}`,
            action: "chat"
          });
        }
      } else {
        // Text to image generation
        const systemMsg = "Extract or create a detailed image generation prompt from the user's message. Be creative and descriptive.";
        const response = await client.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: message }
          ]
        });

        const imagePrompt = response.choices[0].message.content || '';
        
        // Generate images
        const result = await generateImagesParallel(imagePrompt);
        
        if (result.success) {
          return NextResponse.json({
            response: `I've generated 4 images for: ${imagePrompt}`,
            images: result.files,
            action: "generate"
          });
        } else {
          return NextResponse.json({
            response: `Sorry, I couldn't generate images: ${result.error}`,
            action: "chat"
          });
        }
      }
    } else if (wantsThemify || wantsMerge) {
      if (wantsThemify) {
        return NextResponse.json({
          response: "I can help you apply themes to images! Please select an image from the gallery first, or use the Themify tab to upload and theme an image.",
          action: "chat"
        });
      } else {
        return NextResponse.json({
          response: "I can help you merge images! Please use the Merge tab to select or upload two images that you'd like to combine.",
          action: "chat"
        });
      }
    }

    // Regular chat response
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant that specializes in image generation and editing. Be friendly and concise." },
        { role: "user", content: message }
      ]
    });

    return NextResponse.json({
      response: response.choices[0].message.content,
      action: "chat"
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}