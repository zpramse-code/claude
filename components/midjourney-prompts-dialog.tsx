'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Copy,
  Check,
  Search,
  Wand2,
  Loader2,
  Paintbrush,
  User,
  Mountain,
  Shapes,
  Flower2,
  Grid3X3,
  Lightbulb,
  Tag,
  Sparkles,
} from 'lucide-react'
import {
  midjourneyPromptCategories,
  searchPrompts,
  type MidjourneyPrompt,
  type PromptCategory,
} from '@/lib/midjourney-prompts'

const categoryIcons: Record<string, React.ReactNode> = {
  user: <User className="h-4 w-4" />,
  mountain: <Mountain className="h-4 w-4" />,
  shapes: <Shapes className="h-4 w-4" />,
  flower: <Flower2 className="h-4 w-4" />,
  grid: <Grid3X3 className="h-4 w-4" />,
  lightbulb: <Lightbulb className="h-4 w-4" />,
}

function PromptCard({
  prompt,
  onCopy,
  copiedId,
  onPersonalize,
  personalizingId,
  hasDocuments,
}: {
  prompt: MidjourneyPrompt
  onCopy: (id: string, text: string) => void
  copiedId: string | null
  onPersonalize: (prompt: MidjourneyPrompt) => void
  personalizingId: string | null
  hasDocuments: boolean
}) {
  const isCopied = copiedId === prompt.id
  const isPersonalizing = personalizingId === prompt.id

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{prompt.title}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {prompt.style}
          </span>
        </div>

        <p className="text-xs text-muted-foreground font-mono leading-relaxed bg-muted/50 rounded-md p-3 border">
          {prompt.prompt}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onCopy(prompt.id, prompt.prompt)}
          >
            {isCopied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy Prompt
              </>
            )}
          </Button>

          {hasDocuments && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onPersonalize(prompt)}
              disabled={isPersonalizing}
            >
              {isPersonalizing ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Personalizing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Personalize
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MidjourneyPromptsDialog({
  hasDocuments = false,
  documentId,
}: {
  hasDocuments?: boolean
  documentId?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [personalizingId, setPersonalizingId] = useState<string | null>(null)

  // Personalized prompt result
  const [showPersonalized, setShowPersonalized] = useState(false)
  const [personalizedPrompt, setPersonalizedPrompt] = useState('')
  const [personalizedTitle, setPersonalizedTitle] = useState('')
  const [personalizedCopied, setPersonalizedCopied] = useState(false)
  const [personalizeError, setPersonalizeError] = useState<string | null>(null)

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePersonalize = async (prompt: MidjourneyPrompt) => {
    if (!documentId) return

    setPersonalizingId(prompt.id)
    setPersonalizeError(null)

    try {
      const response = await fetch('/api/midjourney-personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          templatePrompt: prompt.prompt,
          templateTitle: prompt.title,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Personalization failed')
      }

      setPersonalizedPrompt(data.personalizedPrompt)
      setPersonalizedTitle(prompt.title)
      setShowPersonalized(true)
    } catch (err) {
      setPersonalizeError(
        err instanceof Error ? err.message : 'Failed to personalize prompt'
      )
    } finally {
      setPersonalizingId(null)
    }
  }

  const handleCopyPersonalized = async () => {
    try {
      await navigator.clipboard.writeText(personalizedPrompt)
      setPersonalizedCopied(true)
      setTimeout(() => setPersonalizedCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getDisplayedPrompts = (): MidjourneyPrompt[] => {
    if (searchQuery.trim()) {
      return searchPrompts(searchQuery)
    }
    if (activeCategory === 'all') {
      return midjourneyPromptCategories.flatMap((c) => c.prompts)
    }
    const cat = midjourneyPromptCategories.find((c) => c.id === activeCategory)
    return cat?.prompts ?? []
  }

  const displayedPrompts = getDisplayedPrompts()

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Paintbrush className="mr-2 h-4 w-4" />
        Midjourney Prompts
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Midjourney Prompt Templates
            </DialogTitle>
            <DialogDescription>
              Browse curated prompts for generating artwork. Copy directly or
              personalize with AI using your uploaded documents.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts by title, style, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveCategory('all')
                setSearchQuery('')
              }}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              All
            </Button>
            {midjourneyPromptCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveCategory(cat.id)
                  setSearchQuery('')
                }}
              >
                {categoryIcons[cat.icon]}
                <span className="ml-1.5">{cat.name}</span>
              </Button>
            ))}
          </div>

          {/* Error Message */}
          {personalizeError && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {personalizeError}
            </div>
          )}

          {/* Prompts Grid */}
          <div className="overflow-y-auto flex-1 pr-1">
            {displayedPrompts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  No prompts found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {displayedPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    onPersonalize={handlePersonalize}
                    personalizingId={personalizingId}
                    hasDocuments={hasDocuments}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Personalized Prompt Result Dialog */}
      <Dialog open={showPersonalized} onOpenChange={setShowPersonalized}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Personalized Prompt
            </DialogTitle>
            <DialogDescription>
              Based on &quot;{personalizedTitle}&quot; &mdash; customized using
              your uploaded document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {personalizedPrompt}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCopyPersonalized}>
                {personalizedCopied ? (
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
              <Button onClick={() => setShowPersonalized(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
