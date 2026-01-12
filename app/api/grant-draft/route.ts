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

    const { documentId, grantQuestion } = await request.json()

    if (!documentId || !grantQuestion) {
      return NextResponse.json(
        { error: 'Document ID and grant question are required' },
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

    // Use Claude to generate grant draft
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
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
              text: `You are a professional grant writer helping an artist with their grant application.

Based on the artist's document/portfolio provided, please write a compelling 300-word response to the following grant application question:

"${grantQuestion}"

Requirements:
- Write exactly 300 words (±10 words is acceptable)
- Use professional yet engaging language
- Draw specific examples and details from the artist's document
- Make the response compelling and relevant to the grant question
- Write in first person as if you are the artist
- Do not include a title or heading, just the response text

Please provide only the grant response text, nothing else.`
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
      grantDraft: textContent.text.trim(),
      wordCount: textContent.text.trim().split(/\s+/).length
    })

  } catch (error) {
    console.error('Grant draft error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
