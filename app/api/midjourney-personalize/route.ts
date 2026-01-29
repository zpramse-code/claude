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

    const { documentId, templatePrompt, templateTitle } = await request.json()

    if (!documentId || !templatePrompt) {
      return NextResponse.json(
        { error: 'Document ID and template prompt are required' },
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

    // Use Claude to personalize the Midjourney prompt
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
              text: `You are an expert at crafting Midjourney image generation prompts for artists.

I have a Midjourney prompt template called "${templateTitle || 'Untitled'}":

${templatePrompt}

Based on the artist's document/portfolio provided, personalize this Midjourney prompt to reflect the artist's unique style, themes, subject matter, and aesthetic sensibilities.

Requirements:
- Keep the same general structure and Midjourney parameters (--ar, --s, --c, --style, --tile, etc.)
- Replace or adapt the descriptive content to align with the artist's work
- Maintain a similar level of detail and prompt length
- Incorporate specific colors, motifs, techniques, or themes found in the artist's document
- The result should feel like a natural Midjourney prompt the artist would use
- Output ONLY the personalized prompt text, nothing else — no explanation, no preamble`
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

    return NextResponse.json({
      success: true,
      personalizedPrompt: textContent.text.trim(),
    })

  } catch (error) {
    console.error('Midjourney personalize error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
