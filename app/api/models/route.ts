import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for API key in environment
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    
    if (!anthropicApiKey) {
      // Return hardcoded models if no API key available
      return NextResponse.json({
        data: [
          {
            id: 'claude-sonnet-4-20250514',
            display_name: 'Claude Sonnet 4',
            description: 'Fast and efficient - great for most conversions',
            pricing: { input: 3, output: 15 }
          },
          {
            id: 'claude-opus-4-20250319', 
            display_name: 'Claude Opus 4.1',
            description: 'Most capable - best for complex or creative content',
            pricing: { input: 15, output: 75 }
          }
        ]
      })
    }

    // Fetch models from Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`)
    }

    const modelsData = await response.json()
    
    // Pricing information for Claude models (per million tokens)
    const modelPricing: Record<string, { input: number; output: number }> = {
      'claude-opus-4': { input: 15, output: 75 },
      'claude-sonnet-4': { input: 3, output: 15 },
      'claude-sonnet-3-7': { input: 3, output: 15 },
      'claude-sonnet-3-5': { input: 3, output: 15 },
      'claude-haiku-3-5': { input: 0.8, output: 4 },
      'claude-opus-3': { input: 15, output: 75 },
      'claude-haiku-3': { input: 0.25, output: 1.25 }
    }
    
    // Function to get pricing for a model
    function getModelPricing(modelId: string) {
      // Extract base model identifier (e.g., 'claude-sonnet-4' from 'claude-sonnet-4-20250514')
      let baseId = modelId
      if (modelId.includes('claude-opus-4')) baseId = 'claude-opus-4'
      else if (modelId.includes('claude-sonnet-4')) baseId = 'claude-sonnet-4'
      else if (modelId.includes('claude-sonnet-3-7')) baseId = 'claude-sonnet-3-7'
      else if (modelId.includes('claude-sonnet-3-5')) baseId = 'claude-sonnet-3-5'
      else if (modelId.includes('claude-haiku-3-5')) baseId = 'claude-haiku-3-5'
      else if (modelId.includes('claude-opus-3')) baseId = 'claude-opus-3'
      else if (modelId.includes('claude-haiku-3')) baseId = 'claude-haiku-3'
      
      return modelPricing[baseId] || null
    }
    
    // Add descriptions and pricing to all available models
    const enrichedModels = (modelsData.data || []).map((model: any) => {
      const pricing = getModelPricing(model.id)
      
      return {
        ...model,
        description: model.id.includes('sonnet') 
          ? 'Fast and efficient - great for most conversions'
          : model.id.includes('opus')
          ? 'Most capable - best for complex or creative content'
          : model.id.includes('haiku')
          ? 'Fastest and most affordable - ideal for simple tasks'
          : 'Balanced performance and efficiency',
        pricing: pricing
      }
    })

    return NextResponse.json({
      data: enrichedModels.length > 0 ? enrichedModels : [
        {
          id: 'claude-sonnet-4-20250514',
          display_name: 'Claude Sonnet 4',
          description: 'Fast and efficient - great for most conversions',
          pricing: { input: 3, output: 15 }
        },
        {
          id: 'claude-opus-4-20250319', 
          display_name: 'Claude Opus 4.1',
          description: 'Most capable - best for complex or creative content',
          pricing: { input: 15, output: 75 }
        }
      ]
    })

  } catch (error) {
    console.error('Error fetching models:', error)
    
    // Return fallback models on error
    return NextResponse.json({
      data: [
        {
          id: 'claude-sonnet-4-20250514',
          display_name: 'Claude Sonnet 4',
          description: 'Fast and efficient - great for most conversions',
          pricing: { input: 3, output: 15 }
        },
        {
          id: 'claude-opus-4-20250319',
          display_name: 'Claude Opus 4.1', 
          description: 'Most capable - best for complex or creative content',
          pricing: { input: 15, output: 75 }
        }
      ]
    })
  }
}