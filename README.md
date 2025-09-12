# 🍌 Nano Banana Agent

An AI-powered image generation and editing platform with a conversational interface. Built with Next.js 15, TypeScript, and Google's Gemini 2.5 Flash image generation capabilities.

## Features

### 💬 Chat Tab
- Conversational interface for AI-powered interactions
- Image-aware conversations with selected images
- Natural language processing for image generation requests

### 🎨 Generate Tab
- AI image generation using Google Gemini 2.5 Flash
- Custom prompt input for creative image generation
- Automatic image saving and gallery integration

### 🖼️ Edit Tab
- AI-powered image editing and modifications
- Upload existing images for editing
- Transform images with natural language descriptions

### 🎭 Themify Tab
- Apply artistic styles and themes to existing images
- Style transfer and artistic transformations
- Theme-based image modifications

### 🔗 Merge Tab
- Combine multiple images using AI
- Create composite images with intelligent merging
- Multi-image selection and blending

### 🌳 Tree View Tab
- Visual organization of generated images
- Hierarchical display of image relationships
- Image management and navigation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **AI Integration**: Google Gemini 2.5 Flash (via OpenRouter)
- **State Management**: Zustand
- **File Handling**: Multer for uploads

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenRouter API key to `.env.local`:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

Build the application for production:

```bash
npm run build
npm start
```

## API Routes

- `/api/chat` - Conversational AI interface
- `/api/generate` - Image generation endpoint
- `/api/edit` - Image editing functionality
- `/api/themify` - Style and theme application
- `/api/merge` - Image merging operations
- `/api/tree` - Tree view data management
- `/api/images-list` - Image gallery listing
- `/api/images/[filename]` - Image serving and management

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main application
├── components/       # React components
│   ├── ChatTab.tsx
│   ├── GenerateTab.tsx
│   ├── EditTab.tsx
│   ├── ThemifyTab.tsx
│   ├── MergeTab.tsx
│   ├── TreeTab.tsx
│   ├── ImageGallery.tsx
│   └── ui/          # UI primitives
└── lib/             # Utilities and context
    ├── TreeContext.tsx
    ├── imageGeneration.ts
    ├── treeUtils.ts
    └── utils.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## License

This project is private and proprietary.
