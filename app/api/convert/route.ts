import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import { join } from 'path'

// We'll create the Anthropic client in the handler with the appropriate key

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
    const { genreHints, userNotes, essayText, isRefinementMode, refinementInstructions, currentStylePrompt, currentLyrics, apiKey, selectedModel } = await request.json()

    if (!essayText || typeof essayText !== 'string') {
      return NextResponse.json(
        { error: 'Essay text is required' },
        { status: 400 }
      )
    }

    // Check for API key in environment or request
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || apiKey
    
    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key required', needsApiKey: true },
        { status: 401 }
      )
    }
    
    // Basic API key validation
    if (apiKey && (!apiKey.startsWith('sk-ant-') || apiKey.length < 50)) {
      return NextResponse.json(
        { error: 'Invalid API key format', needsApiKey: true },
        { status: 401 }
      )
    }

    const systemPrompt = await loadSystemPrompt()

    // Create Anthropic client with the appropriate API key
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    })

    // Construct the user message in XML format
    let userMessage = ''
    
    if (isRefinementMode) {
      userMessage = `<refinement_request>
<refinement_instructions>${refinementInstructions}</refinement_instructions>
<current_style_prompt>${currentStylePrompt || ''}</current_style_prompt>
<current_lyrics>${currentLyrics || ''}</current_lyrics>
<original_essay_text>${essayText}</original_essay_text>
</refinement_request>`
    } else {
      userMessage = `<conversion_request>
<essay_text>${essayText}</essay_text>
<genre_hints>${genreHints?.trim() || ''}</genre_hints>
<user_notes>${userNotes?.trim() || ''}</user_notes>
</conversion_request>`
    }

    // Use the selected model ID directly since it comes from the models API
    // Fallback to Sonnet 4 if no model selected
    const modelId = selectedModel || 'claude-sonnet-4-20250514'

    const message = await anthropic.messages.create({
      model: modelId,
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
    
    if (error instanceof Error) {
      // Handle API key related errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Anthropic API key.', needsApiKey: true },
          { status: 401 }
        )
      }
      
      // Handle rate limiting
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to convert essay. Please try again.' },
      { status: 500 }
    )
  }
}