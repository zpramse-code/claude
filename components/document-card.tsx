'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Image, Music, Video, File, Sparkles, Loader2 } from 'lucide-react'
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
  const [reviewing, setReviewing] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

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
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {formatFileSize(document.file_size)}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handleReview}
              disabled={reviewing}
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
          </div>
          {error && (
            <div className="mt-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

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
    </>
  )
}
