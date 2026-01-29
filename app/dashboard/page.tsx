import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, File, LogOut, Upload } from 'lucide-react'
import { UploadDocumentDialog } from '@/components/upload-document-dialog'
import { DocumentCard } from '@/components/document-card'
import { MidjourneyPromptsDialog } from '@/components/midjourney-prompts-dialog'

async function getDocuments(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }

  return data || []
}

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data
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

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const documents = await getDocuments(user.id)
  const profile = await getProfile(user.id)

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Artist Vault</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                In your vault
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all files
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Upload</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.length > 0 ? formatDate(documents[0].created_at).split(',')[0] : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {documents.length > 0 ? 'Last activity' : 'No uploads yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Artist Vault Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Artist Vault</h2>
            <p className="text-muted-foreground">
              A curated collection of your creative works
            </p>
          </div>
          <div className="flex gap-3">
            <MidjourneyPromptsDialog
              hasDocuments={documents.length > 0}
              documentId={documents.length > 0 ? documents[0].id : undefined}
            />
            <UploadDocumentDialog />
          </div>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your vault is empty</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start building your creative collection by uploading your first document
              </p>
              <UploadDocumentDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
