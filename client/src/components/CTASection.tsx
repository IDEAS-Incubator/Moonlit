import { Button } from "@/components/ui/button"
import Link from "next/link"; 
export default function CTASection() {
  return (
    <section className="text-center space-y-6 bg-muted p-12 rounded-lg">
      <h2 className="text-3xl font-bold">Ready to Transform Bedtime?</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Join thousands of parents who&rsquo;ve made bedtime a magical experience with ComicDreams.
      </p>
      <Link href="/try-beta">
          <Button size="lg">Get Started</Button>
      </Link>
    </section>
  )
}