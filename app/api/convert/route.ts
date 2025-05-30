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

    // Construct the user message in XML format
    const userMessage = `<conversion_request>
<genre_hints>${genreHints?.trim() || ''}</genre_hints>
<user_notes>${userNotes?.trim() || ''}</user_notes>
<essay_text>${essayText}</essay_text>
</conversion_request>`

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

    // Parse XML response
    let stylePrompt = ''
    let lyrics = ''
    
    try {
      // Extract content between XML tags
      const stylePromptMatch = responseText.match(/<style_prompt>([\s\S]*?)<\/style_prompt>/)
      const lyricsMatch = responseText.match(/<lyrics>([\s\S]*?)<\/lyrics>/)
      
      stylePrompt = stylePromptMatch ? stylePromptMatch[1].trim() : ''
      lyrics = lyricsMatch ? lyricsMatch[1].trim() : ''
      
      // If we couldn't parse XML properly, try to extract from full response
      if (!stylePrompt && !lyrics) {
        return NextResponse.json({
          stylePrompt: 'Could not parse XML response',
          lyrics: responseText,
        })
      }
    } catch (parseError) {
      console.error('Error parsing XML response:', parseError)
      return NextResponse.json({
        stylePrompt: 'XML parsing error',
        lyrics: responseText,
      })
    }

    return NextResponse.json({
      stylePrompt: stylePrompt || 'No style prompt found',
      lyrics: lyrics || 'No lyrics found',
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