import { NextRequest, NextResponse } from 'next/server'
import TurndownService from 'turndown'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

interface FetchTextRequest {
  url: string
}

interface FetchTextResponse {
  text: string
  title?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FetchTextRequest = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch the HTML content
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      )
    }

    const html = await response.text()

    // Parse HTML and extract readable content
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article || !article.content) {
      return NextResponse.json(
        { error: 'Could not extract readable content from the URL' },
        { status: 400 }
      )
    }

    // Convert HTML to plain text (not markdown for essay processing)
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    })
    const markdown = turndownService.turndown(article.content)
    
    // Clean up the markdown to make it more suitable for essay processing
    const cleanText = markdown
      .replace(/^#{1,6}\s+/gm, '') // Remove heading markers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim()

    const result: FetchTextResponse = {
      text: cleanText,
      title: article.title || undefined
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching text:', error)
    return NextResponse.json(
      { error: 'Failed to fetch and process the URL' },
      { status: 500 }
    )
  }
}