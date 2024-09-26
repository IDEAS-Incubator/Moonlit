import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import ContactSection from '@/components/ContactSection'
import CTASection from '@/components/CTASection'
import '../styles/global.css';  // Import your global CSS file


export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-24">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        {/* <ContactSection /> */}
        <CTASection />
      </main>
      <footer className="container mx-auto py-6 text-center text-muted-foreground">
        <p>&copy; 2024 ComicDreams. All rights reserved.</p>
      </footer>
    </div>
  )
}