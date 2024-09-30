import Link from 'next/link'

export default function Header() {
  return (
    <header className="container mx-auto py-6">
      <nav className="flex justify-between items-center">
        <div className="text-2xl font-bold">Moonlit</div>
        <div className="space-x-4">
          <Link href="/" className="text-sm font-medium hover:underline">Home</Link>
          <Link href="/features" className="text-sm font-medium hover:underline">Features</Link>
          <Link href="/testimonials" className="text-sm font-medium hover:underline">Testimonials</Link>
          <Link href="/try-beta" className="text-sm font-medium hover:underline">Try Beta</Link>
        </div>
      </nav>
    </header>
  )
}