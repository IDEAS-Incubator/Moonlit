"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Modal } from '@/components/Modal'; 
import '../../styles/global.css'; 
import { toast, Toaster } from 'react-hot-toast';

export default function TryBetaPage() {
  const [email, setEmail] = useState('');
  const [scenario, setScenario] = useState('');
  const [style, setStyle] = useState('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [viewLink, setViewLink] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Track whether the modal is open

  // Fetch API URL from environment variables
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Default to localhost if undefined

    // Word count function
  const countWords = (text: string) => {
      return text.trim().split(/\s+/).length;
  };
  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!email || !scenario || !style) {
      toast.error("All fields must be filled.");
      return; // Exit early if validation fails
    }

    // Check if the email is valid
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return; // Exit early if validation fails
    }

    // Check if the scenario has between 50 and 300 words
    const wordCount = countWords(scenario);
    if (wordCount < 30 || wordCount > 300) {
      toast.error("Scenario must be between 50 and 300 words.");
      return; // Exit early if validation fails
    }

    // Start loading and show toast
    setLoading(true);
    const loadingToastId = toast.loading("Generating comic... Please wait.");

    try {
      // Send the form data to the FastAPI backend using the API_URL from .env
      const response = await fetch(`${API_URL}/send_comic_email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          style,
          email
        }),
      });

      const data = await response.json();

      // Set the download and view links from the API response
      if (data.download_url) {
        setDownloadLink(`${API_URL}${data.download_url}`);
        toast.success("Comic generated successfully!", { id: loadingToastId });  // Success toast
      }

      if (data.view_url) {
        setViewLink(`${API_URL}${data.view_url}`);
      }

    } catch (error) {
      console.error('Error generating the comic:', error);
      toast.error("Failed to generate the comic.", { id: loadingToastId });  // Error toast
    } finally {
      // Stop loading
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Toaster to display toast notifications */}
      <Toaster position="top-right" />

      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">Try ComicDreams Beta</h1>

        <section className="text-center mb-8 px-4">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
                Welcome to ComicDreams Beta! We are excited to offer you the opportunity to experience our AI-driven comic generator.
                Use the form below to create your own personalized comic stories in a few simple steps. It&rsquo;s quick, fun, and designed to inspire creativity!

            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Just enter a scenario, choose a style, and provide your email. We will send you the generated comic, and you can view or download it instantly.
            </p>
        </section>


        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Scenario Input as Textarea */}
          <div>
            <label htmlFor="scenario" className="block text-sm font-medium mb-2">Scenario (30-300 words)</label>
            <textarea
              id="scenario"
              placeholder="Alice and Bob find a mysterious cave"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={5} // Adjusts the height of the textarea
            />
          </div>

          {/* Style Input */}
          <div>
            <label htmlFor="style" className="block text-sm font-medium mb-2">Style</label>
            <Input
              id="style"
              type="text"
              placeholder="anime, hand-drawn, vibrant colors"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button  type="submit" className="w-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Stories'}
          </Button>
        </form>

        {/* Links for Download and View */}
        {downloadLink && (
          <div className="mt-8 text-center">
            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Download your comic here
            </a>
            {viewLink && (
              <div className="mt-4">
                {/* When "View your comic in the browser" is clicked, show the modal */}
                <button
                  className="text-blue-500 underline"
                  onClick={() => setShowModal(true)}
                >
                  View your comic
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal to display the PDF */}
      <Modal
        showModal={showModal}
        onClose={() => setShowModal(false)} // Close the modal
        pdfUrl={viewLink || ''} // Pass the view URL to the modal
      />

      <Footer />
    </div>
  );
}
