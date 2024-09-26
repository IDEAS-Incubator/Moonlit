import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  { title: "Personalized Stories", description: "Create unique comics tailored to your child's interests and preferences." },
  { title: "AI-Powered Generation", description: "Utilize advanced AI to generate engaging and age-appropriate content." },
  { title: "Educational Themes", description: "Incorporate learning opportunities into bedtime stories." },
  { title: "Customizable Characters", description: "Let your child be the hero of their own bedtime adventure." },
  { title: "Soothing Narratives", description: "Specially crafted stories to help children relax and prepare for sleep." },
  { title: "Parent Dashboard", description: "Monitor your child's reading habits and favorite themes." }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}