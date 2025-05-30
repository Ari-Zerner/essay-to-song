# Essay to Song Converter - Project Knowledge

## Project Overview
A Next.js web application that transforms essays into songs using Claude AI. The app extracts euphonic passages from text and arranges them into song lyrics with Suno-compatible formatting.

## Key Technologies
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Anthropic SDK** for Claude AI integration
- **CSS** for styling (no framework)
- **Vercel** deployment ready

## Development Workflow

### Scripts to Run After Changes
Always run type checking after code changes:
```bash
npm run type-check && npm run lint
```

### Git Workflow
**Important**: Make git commits at appropriate checkpoints during development:
- After completing features or significant changes
- Before major refactoring
- When reaching stable states
- After fixing bugs or issues
- Use descriptive commit messages that explain the "why" not just the "what"

### Environment Setup
- Copy `env.example` to `.env.local`
- Add `ANTHROPIC_API_KEY` environment variable
- Never commit API keys to version control

## Architecture

### API Structure
- Single API endpoint: `/api/convert/route.ts`
- Loads system prompt from `systemPrompt.md`
- Returns structured response with `stylePrompt` and `lyrics`

### System Prompt
- Located in `systemPrompt.md` at project root
- Contains detailed instructions for Claude on text-to-song transformation
- Emphasizes preserving original author's voice and meaning
- Includes Suno-specific formatting guidelines

### Frontend Components
- Single page app in `app/page.tsx`
- Form with genre hints (optional) and essay text (required)
- Real-time loading states and error handling
- Read-only output formatted for Suno

## Code Style Preferences
- Use TypeScript interfaces for type safety
- Prefer async/await over promises
- Include comprehensive error handling
- Use semantic HTML and accessible form labels
- Keep components simple and focused

## Deployment
- Optimized for Vercel deployment
- Environment variables configured in Vercel dashboard
- No build-time secrets required

## Common Tasks

### Adding New Features
- Most changes will be in `app/page.tsx` for UI
- API changes go in `app/api/convert/route.ts`
- System prompt modifications in `systemPrompt.md`

### Testing Changes
- Run `npm run dev` to test locally
- Check browser console for errors
- Test with various essay lengths and genres
- Verify Suno formatting in output

## Important Notes
- The app processes text client-side before sending to API
- Claude responses are parsed to extract style prompts and lyrics
- Fallback handling when parsing fails
- Rate limiting handled by Anthropic SDK
- No user data persistence - stateless design
