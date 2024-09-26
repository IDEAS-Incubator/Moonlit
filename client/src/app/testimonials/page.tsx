import Header from '@/components/Header'
import TestimonialsSection from '@/components/TestimonialsSection'

import Footer from '@/components/Footer'
import '../../styles/global.css';  // Import your global CSS file

export default function Testimonials() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-24">
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}