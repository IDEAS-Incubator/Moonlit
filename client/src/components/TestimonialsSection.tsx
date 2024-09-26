"use client";
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  { name: "Sarah L.", role: "Parent", content: "This app has become an essential part of our bedtime routine. My kids love the personalized stories!" },
  { name: "Mike T.", role: "Teacher", content: "As an educator, I'm impressed by how this tool sparks creativity and encourages reading." },
  { name: "Emily R.", role: "Child Psychologist", content: "The soothing nature of these comics really helps children transition to sleep mode." },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="space-y-8">
      <h2 className="text-3xl font-bold text-center">What Parents and Educators Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full">
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}