import { Button } from "@/components/ui/button";
import Link from "next/link"; // Import the Link component from Next.js

export default function HeroSection() {
  return (
    <section id="home" className="text-center space-y-6">
      <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">Generate Bedtime Comics in Seconds</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Create personalized comic stories to help your kids wind down before sleep. Spark imagination and sweet dreams.
      </p>
      <div className="flex justify-center">
        {/* Wrap the button in the Link component to navigate to a new page */}
        <Link href="/try-beta">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </section>
  );
}
