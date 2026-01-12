'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Image, Music, Video, File, Sparkles, Loader2, FileEdit, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Document {
  id: string
  title: string
  description: string | null
  file_type: string | null
  file_size: number | null
  created_at: string
}

interface ReviewAnalysis {
  artist_name: string
  themes: string[]
  raw_response?: string
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return <File className="h-12 w-12" />

  if (fileType.startsWith('image/')) return <Image className="h-12 w-12" />
  if (fileType.startsWith('video/')) return <Video className="h-12 w-12" />
  if (fileType.startsWith('audio/')) return <Music className="h-12 w-12" />
  if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-12 w-12" />

  return <File className="h-12 w-12" />
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return 'Unknown size'

  const kb = bytes / 1024
  const mb = kb / 1024

  if (mb >= 1) return `${mb.toFixed(2)} MB`
  return `${kb.toFixed(2)} KB`
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function DocumentCard({ document }: { document: Document }) {
  // Review state
  const [reviewing, setReviewing] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Grant draft state
  const [showGrantQuestion, setShowGrantQuestion] = useState(false)
  const [grantQuestion, setGrantQuestion] = useState('')
  const [generatingGrant, setGeneratingGrant] = useState(false)
  const [grantDraft, setGrantDraft] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [showGrantDraft, setShowGrantDraft] = useState(false)
  const [grantError, setGrantError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleReview = async () => {
    setReviewing(true)
    setError(null)

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: document.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Review failed')
      }

      setAnalysis(data.analysis)
      setShowReview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review document')
    } finally {
      setReviewing(false)
    }
  }

  const handleGenerateGrant = async () => {
    if (!grantQuestion.trim()) {
      setGrantError('Please enter a grant question')
      return
    }

    setGeneratingGrant(true)
    setGrantError(null)

    try {
      const response = await fetch('/api/grant-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          grantQuestion: grantQuestion
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Grant generation failed')
      }

      setGrantDraft(data.grantDraft)
      setWordCount(data.wordCount)
      setShowGrantQuestion(false)
      setShowGrantDraft(true)
    } catch (err) {
      setGrantError(err instanceof Error ? err.message : 'Failed to generate grant draft')
    } finally {
      setGeneratingGrant(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(grantDraft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-muted p-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {getFileIcon(document.file_type)}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(document.created_at)}
            </span>
          </div>
          <CardTitle className="line-clamp-1">{document.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {document.description || 'No description provided'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatFileSize(document.file_size)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleReview}
                disabled={reviewing}
                className="flex-1"
              >
                {reviewing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Review
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGrantQuestion(true)}
                className="flex-1"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Grant Draft
              </Button>
            </div>

            {error && (
              <div className="text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Document Review
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis of {document.title}
            </DialogDescription>
          </DialogHeader>

          {analysis && (
            <div className="space-y-6 py-4">
              {/* Artist Name */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Artist Name
                </h3>
                <p className="text-xl font-bold">{analysis.artist_name}</p>
              </div>

              {/* Key Themes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Three Key Themes
                </h3>
                <div className="space-y-2">
                  {analysis.themes.map((theme, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-sm pt-0.5">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowReview(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grant Question Dialog */}
      <Dialog open={showGrantQuestion} onOpenChange={setShowGrantQuestion}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-primary" />
              Generate Grant Draft
            </DialogTitle>
            <DialogDescription>
              Enter the grant application question and we'll draft a 300-word response based on {document.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="grant-question" className="text-sm font-medium">
                Grant Application Question
              </label>
              <Textarea
                id="grant-question"
                placeholder="e.g., Describe your artistic practice and how this grant will support your work..."
                value={grantQuestion}
                onChange={(e) => setGrantQuestion(e.target.value)}
                disabled={generatingGrant}
                className="min-h-[120px]"
              />
            </div>

            {grantError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {grantError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGrantQuestion(false)
                  setGrantQuestion('')
                  setGrantError(null)
                }}
                disabled={generatingGrant}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateGrant}
                disabled={!grantQuestion.trim() || generatingGrant}
              >
                {generatingGrant ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Draft
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Draft Display Dialog */}
      <Dialog open={showGrantDraft} onOpenChange={setShowGrantDraft}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-primary" />
              Grant Draft Response
            </DialogTitle>
            <DialogDescription>
              AI-generated response ({wordCount} words)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Grant Draft Text */}
            <div className="space-y-2">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {grantDraft}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-muted-foreground">
                Word count: {wordCount}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowGrantDraft(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
