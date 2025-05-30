# Essay to Song Converter

A web application that transforms essays into songs using Claude AI, designed for easy hosting on Vercel.

## Features

- Simple, intuitive interface with genre hints input
- Large text area for essay input
- Read-only output area showing generated songs in Suno-compatible format
- TypeScript for type safety and better development experience
- Responsive design that works on desktop and mobile
- Integration with Claude AI for intelligent essay-to-song conversion

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## System Prompt

The application loads Claude's system prompt from `systemPrompt.md`. This file contains detailed instructions for how Claude should transform essays into songs, including:

- Text analysis principles
- Euphonic selection criteria
- Song structure guidelines
- Suno-specific formatting instructions
- Style prompt creation guidelines

## Deployment

This app is optimized for Vercel deployment:

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your `ANTHROPIC_API_KEY` environment variable in the Vercel dashboard

3. **Deploy:**
   - Vercel will automatically build and deploy your app
   - Your app will be available at a vercel.app URL

## Usage

1. **Enter genre hints** (optional): Specify the musical style you want (e.g., "folk", "indie rock", "acoustic ballad")

2. **Paste your essay**: Add the text you want to convert into the large text area

3. **Click "Convert to Song"**: The app will send your essay to Claude for transformation

4. **Copy the result**: The output will be formatted for direct use with Suno, including both the style prompt and lyrics

## Project Structure

```
├── app/
│   ├── api/convert/route.ts    # API endpoint for Claude integration
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Main page component
├── systemPrompt.md             # Claude's system prompt
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Anthropic SDK** - Integration with Claude AI
- **CSS** - Custom styling with responsive design
- **Vercel** - Optimized for deployment platform