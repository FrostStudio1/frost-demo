import type { Metadata } from 'next'
import './globals.css'
import { signOut } from './auth/actions'

export const metadata: Metadata = {
  title: 'Frost Demo',
  description: 'Minimal Next 14 + Supabase Auth',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">Frost Demo</a>
            <form action={signOut}>
              <button className="btn" type="submit">Logga ut</button>
            </form>
          </div>
        </header>

        <main className="container py-10">{children}</main>

        <footer className="border-t mt-16">
          <div className="container py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Frost Bygg
          </div>
        </footer>
      </body>
    </html>
  )
}

