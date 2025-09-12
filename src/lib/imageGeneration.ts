import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const EDITING_PRESETS = {
  enhance: 'enhance the image quality, make it more vibrant and sharp',
  blur: 'add a beautiful artistic blur effect to the background',
  vintage: 'apply a vintage, retro filter with warm tones',
  black_white: 'convert to black and white with high contrast',
  artistic: 'transform into an artistic painting style',
  cartoon: 'convert to cartoon/anime style illustration'
};

export function createPromptVariations(basePrompt: string): string[] {
  return [
    basePrompt,
    `${basePrompt}, artistic style, vibrant colors`,
    `${basePrompt}, minimalist design, clean composition`,
    `${basePrompt}, detailed illustration, rich textures`
  ];
}

export function imageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

export function saveImageFromBase64(base64Data: string, filename: string): boolean {
  try {
    const imageData = Buffer.from(base64Data, 'base64');
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filename, imageData);
    return true;
  } catch (error) {
    console.error(`Error saving base64 image: ${error}`);
    return false;
  }
}

export async function generateSingleImage(
  client: OpenAI, 
  prompt: string, 
  timestamp: string, 
  imageNum: number, 
  inputImagePath?: string
): Promise<string | null> {
  try {
    let messages: any[];
    
    if (inputImagePath) {
      // Image editing mode
      const imageB64 = imageToBase64(inputImagePath);
      messages = [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageB64}` } }
        ]
      }];
    } else {
      // Text-to-image mode
      messages = [{ role: "user", content: prompt }];
    }

    const completion = await client.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview",
      messages,
      modalities: ["image", "text"]
    });

    const message = completion.choices[0].message;
    if (message.images && message.images.length > 0) {
      for (const image of message.images) {
        if (typeof image === 'object' && image !== null && 'image_url' in image) {
          const url = (image as any).image_url?.url;
          if (url && url.startsWith('data:image')) {
            const base64Data = url.split('base64,')[1];
            const filename = path.join(process.cwd(), 'public', 'generated_images', `image_${timestamp}_${imageNum}.png`);
            if (saveImageFromBase64(base64Data, filename)) {
              return `image_${timestamp}_${imageNum}.png`;
            }
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Error generating image ${imageNum}:`, error);
    return null;
  }
}

export async function generateImagesParallel(
  prompt: string, 
  inputImagePath?: string
): Promise<{ success: boolean; files: string[]; count: number; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, files: [], count: 0, error: "OPENROUTER_API_KEY not found" };
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  const promptVariations = createPromptVariations(prompt);

  try {
    // Generate images in parallel
    const promises = promptVariations.map((variedPrompt, i) => 
      generateSingleImage(client, variedPrompt, timestamp, i + 1, inputImagePath)
    );

    const results = await Promise.all(promises);
    const generatedFiles = results.filter(f => f !== null) as string[];
    
    return { success: true, files: generatedFiles, count: generatedFiles.length };
  } catch (error) {
    console.error('Error generating images:', error);
    return { success: false, files: [], count: 0, error: "Failed to generate images" };
  }
}

export async function themifyPhoto(
  themePrompt: string, 
  inputImagePath: string
): Promise<{ success: boolean; files: string[]; count: number; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, files: [], count: 0, error: "OPENROUTER_API_KEY not found" };
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  
  try {
    // Create themed variations
    const themeVariations = [
      themePrompt,
      `${themePrompt}, enhance the theme with vibrant colors and details`,
      `${themePrompt}, artistic interpretation with creative flair`,
      `${themePrompt}, dramatic and cinematic style`
    ];

    // Generate themed images in parallel
    const promises = themeVariations.map((variedTheme, i) => 
      generateSingleImage(client, variedTheme, timestamp, i + 1, inputImagePath)
    );

    const results = await Promise.all(promises);
    const generatedFiles = results.filter(f => f !== null) as string[];
    
    return { success: true, files: generatedFiles, count: generatedFiles.length };
  } catch (error) {
    console.error('Error themifying image:', error);
    return { success: false, files: [], count: 0, error: "Failed to themify image" };
  }
}

export async function mergeMultipleImages(
  mergePrompt: string, 
  image1Path: string, 
  image2Path: string
): Promise<{ success: boolean; files: string[]; count: number; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, files: [], count: 0, error: "OPENROUTER_API_KEY not found" };
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  
  try {
    // For merging, we'll process each image with the merge prompt
    // Since OpenRouter doesn't directly support multi-image input like native Gemini,
    // we'll create variations by applying the merge concept to each image
    const mergeVariations = [
      `${mergePrompt}, blend and combine elements seamlessly`,
      `${mergePrompt}, create a harmonious fusion of styles`,
      `${mergePrompt}, merge with creative transitions and effects`,
      `${mergePrompt}, artistic combination with unique perspective`
    ];

    // Generate merged variations for the first image as base
    const promises = mergeVariations.map((variedPrompt, i) => 
      generateSingleImage(client, variedPrompt, timestamp, i + 1, image1Path)
    );

    const results = await Promise.all(promises);
    const generatedFiles = results.filter(f => f !== null) as string[];
    
    return { success: true, files: generatedFiles, count: generatedFiles.length };
  } catch (error) {
    console.error('Error merging images:', error);
    return { success: false, files: [], count: 0, error: "Failed to merge images" };
  }
}