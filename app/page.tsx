import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Lock, Zap, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Artist Vault</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Creative Works,{' '}
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Beautifully Organized
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Artist Vault provides a sophisticated gallery space for your digital creations.
            Store, organize, and showcase your work with elegance.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg">
                Start Your Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold tracking-tight mb-4">
            A Vault Designed for Artists
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your creative portfolio in one elegant space
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-2">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gallery Aesthetic</CardTitle>
              <CardDescription>
                A clean, minimalist interface inspired by art galleries.
                Let your work take center stage.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-2">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure Storage</CardTitle>
              <CardDescription>
                Your creative works are protected with enterprise-grade
                security powered by Supabase.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with Next.js 14 for blazing-fast performance
                and seamless user experience.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-2 max-w-4xl mx-auto">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold tracking-tight">
                Ready to Build Your Collection?
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Join Artist Vault today and experience a better way to
                organize and showcase your creative works.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-lg">
                  Create Your Vault
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Artist Vault. Built with Next.js 14 and Supabase.</p>
        </div>
      </footer>
    </div>
  )
}
