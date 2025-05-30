# Essay to Song Converter

Transform essays into songs using Claude AI with an intuitive interface designed for [Suno](https://suno.ai) workflow.

## ✨ Features

### Core Functionality
- **Smart text analysis** - Extracts euphonic passages while preserving meaning
- **Genre-aware conversion** - Optional genre hints for style direction
- **File upload support** - Upload `.txt`, `.md`, `.doc`, `.docx` files
- **XML-structured output** - Separate style prompts and lyrics for easy copying
- **Suno-compatible formatting** - Ready-to-use song structure with performance tags

### Advanced Workflow
- **Refinement system** - Iteratively improve songs without losing previous versions
- **Version history** - Navigate through all conversions and refinements with timestamps
- **Mode toggle** - Switch between new conversions and refining existing content
- **Selective refinement** - Refine any version, not just the latest

### User Experience
- **Responsive design** - Works seamlessly on desktop and mobile
- **Copy buttons** - Individual copy functionality for style prompts and lyrics
- **API key flexibility** - Works with environment variables OR user-provided API keys
- **Real-time validation** - Smart form validation and error handling

## 🚀 Quick Start

### Option 1: With Environment Variable (Recommended for deployment)
1. **Clone and install:**
   ```bash
   git clone https://github.com/Ari-Zerner/essay-to-song.git
   cd essay-to-song
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

3. **Run:**
   ```bash
   npm run dev
   ```

### Option 2: User-Provided API Key (No setup required)
1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd essay-to-song
   npm install
   npm run dev
   ```

2. **Enter API key in the app:**
   - The app will show an API key input field
   - Get your key from [console.anthropic.com](https://console.anthropic.com)
   - Enter it securely (never stored, only used for the session)

## 📖 How to Use

### Basic Conversion
1. **Input your content:**
   - Upload a file OR paste text directly
   - Add optional genre hints (e.g., "folk", "indie rock", "electronic")
   - Include any additional notes or style preferences

2. **Convert:**
   - Click "Convert to Song"
   - Get separate style prompt and lyrics
   - Copy each section individually for Suno

### Refinement Workflow
1. **Switch to refinement mode** after initial conversion
2. **Add specific instructions** like:
   - "Make the chorus catchier"
   - "Add a bridge section"
   - "More upbeat style"
   - "Improve rhyming in verse 2"
3. **Navigate versions** using Previous/Next buttons
4. **Refine any version** - not just the latest

## 🌐 Deployment on Vercel

### Method 1: With Environment Variable (Recommended)
1. **Push to GitHub**
2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
3. **Add environment variable:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` with your API key
4. **Deploy** - Vercel handles the rest!

### Method 2: User-Provided Keys Only
1. **Push to GitHub**
2. **Import to Vercel** - no environment variables needed
3. **Deploy** - users will input their own API keys

## 🛠️ Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checking

### Project Structure
```
├── app/
│   ├── api/
│   │   ├── check-api-key/route.ts  # API key availability check
│   │   └── convert/route.ts        # Main conversion endpoint
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main application
├── systemPrompt.md                 # Claude's detailed instructions
├── env.example                     # Environment variable template
└── CLAUDE.md                       # Development guidelines
```

## 🔒 Security & Privacy

- **API keys** are never stored client-side
- **User content** is not logged or persisted
- **Environment variables** take priority over user input
- **HTTPS transmission** for all API communications
- **No user tracking** or analytics

## 🎵 Suno Integration

The app generates:
- **Style Prompt**: Musical direction for Suno's AI
- **Lyrics**: Structured song with `[Verse]`, `[Chorus]`, `[Bridge]` tags
- **Performance notes**: Tempo, mood, and instrumentation hints

Simply copy each section into Suno for immediate song generation!

## 🔧 Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Anthropic SDK** - Claude AI integration
- **CSS** - Custom styling with responsive design
- **Vercel** - Optimized deployment platform

## 📄 License

MIT License - feel free to use and modify for your projects!

---

**Get your Anthropic API key:** [console.anthropic.com](https://console.anthropic.com)  
**Try Suno:** [suno.ai](https://suno.ai)