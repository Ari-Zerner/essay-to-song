import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import { join } from 'path'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function loadSystemPrompt(): Promise<string> {
  try {
    const systemPromptPath = join(process.cwd(), 'systemPrompt.md')
    const systemPrompt = await readFile(systemPromptPath, 'utf-8')
    return systemPrompt
  } catch (error) {
    console.error('Error loading system prompt:', error)
    return 'You are a helpful assistant that converts essays into songs.'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { genreHints, userNotes, essayText } = await request.json()

    if (!essayText || typeof essayText !== 'string') {
      return NextResponse.json(
        { error: 'Essay text is required' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = await loadSystemPrompt()

    // Construct the user message
    let userMessage = `Please convert the following essay into a song:`

    if (genreHints && genreHints.trim()) {
      userMessage += `\n\nGenre/Style Hints: ${genreHints.trim()}`
    }

    if (userNotes && userNotes.trim()) {
      userMessage += `\n\nAdditional Notes: ${userNotes.trim()}`
    }

    userMessage += `\n\nEssay Text:\n${essayText}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Unable to process response'

    // Try to parse the response to extract style prompt and lyrics
    // Using [\s\S]* instead of the /s flag for cross-line matching
    const stylePromptMatch = responseText.match(/\*\*STYLE PROMPT:\*\*\s*```([^`]+)```/) ||
                            responseText.match(/STYLE PROMPT:\s*```([^`]+)```/) ||
                            responseText.match(/\*\*STYLE PROMPT:\*\*\s*([^\n]+(?:\n(?![\*\#])[^\n]*)*)/) ||
                            responseText.match(/STYLE PROMPT:\s*([^\n]+(?:\n(?![\*\#])[^\n]*)*)/)

    const lyricsMatch = responseText.match(/\*\*LYRICS:\*\*\s*```([^`]+)```/) ||
                       responseText.match(/LYRICS:\s*```([^`]+)```/) ||
                       responseText.match(/\*\*LYRICS:\*\*\s*([^\n]+(?:\n(?![\*\#])[^\n]*)*)/) ||
                       responseText.match(/LYRICS:\s*([^\n]+(?:\n(?![\*\#])[^\n]*)*)/)

    const stylePrompt = stylePromptMatch ? stylePromptMatch[1].trim() : ''
    const lyrics = lyricsMatch ? lyricsMatch[1].trim() : ''

    // If we couldn't parse properly, return the full response
    if (!stylePrompt && !lyrics) {
      return NextResponse.json({
        stylePrompt: 'See full response below',
        lyrics: responseText,
      })
    }

    return NextResponse.json({
      stylePrompt: stylePrompt || 'No style prompt found',
      lyrics: lyrics || responseText,
    })

  } catch (error) {
    console.error('Error converting essay:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Anthropic API configuration.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to convert essay. Please try again.' },
      { status: 500 }
    )
  }
}