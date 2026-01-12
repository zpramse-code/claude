import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Extract filename from file_url
    const urlParts = document.file_url.split('/documents/')
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      )
    }
    const filePath = urlParts[1]

    // Download the PDF from Supabase storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(filePath)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download document' },
        { status: 500 }
      )
    }

    // Convert blob to base64
    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Use Claude to analyze the PDF
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Please analyze this document and provide the following information in a structured format:

1. Artist Name: (The name of the artist or creator mentioned in this document)
2. Three Key Themes: (Three main themes, subjects, or focuses of this artist's work)

Please format your response as a JSON object with the following structure:
{
  "artist_name": "name here",
  "themes": ["theme 1", "theme 2", "theme 3"]
}

If you cannot find specific information, use your best judgment based on the content available.`
            }
          ],
        },
      ],
    })

    // Extract the response
    const textContent = message.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to get response from Claude' },
        { status: 500 }
      )
    }

    // Try to parse the JSON response
    let analysis
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, parse the entire response
        analysis = JSON.parse(textContent.text)
      }
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        success: true,
        analysis: {
          raw_response: textContent.text,
          artist_name: 'Unable to parse',
          themes: []
        }
      })
    }

    return NextResponse.json({
      success: true,
      analysis: {
        artist_name: analysis.artist_name || 'Unknown',
        themes: analysis.themes || [],
        raw_response: textContent.text
      }
    })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
