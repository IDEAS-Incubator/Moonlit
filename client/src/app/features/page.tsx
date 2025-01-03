import Header from '@/components/Header'
import FeaturesSection from '@/components/FeaturesSection'

import Footer from '@/components/Footer'
import '../../styles/global.css';  // Import your global CSS file

export default function Features() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      <main className="container mx-auto px-4 py-12 space-y-24">
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}