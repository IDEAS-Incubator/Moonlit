"use client";
import { SetStateAction, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Modal } from '@/components/Modal'; 
import '../../styles/global.css'; 
import { toast, Toaster } from 'react-hot-toast';
import { FiRefreshCw } from 'react-icons/fi';

import { AppDispatch, RootState } from '@/lib/store/store';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setToken } from '@/lib/store/features/user/user';
import { useRouter } from 'next/navigation';

export default function TryBetaPage() {
  
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const pathname = window.location.pathname // Get the current path

    // Skip redirection for reset password route
    if (pathname.startsWith('/reset-password/') || pathname.startsWith("/complete-signup/")) {
      return
    }


    if (!token) {
      router.replace('/login') // Redirect to login if token is missing
      return
    }

    // Set token in Redux store if not already present
    if (!auth.token) {
      dispatch(setToken(token))
    }
  }, [dispatch, auth.token, router])




  const [email, setEmail] = useState('');
  const [scenario, setScenario] = useState('');
  const [style, setStyle] = useState('');
  const [language, setLanguage] = useState('');
  const [layout, setLayout] = useState('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [viewLink, setViewLink] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0); // Track the current example index


  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const scenarioExamples = [
    "Francis is a medieval knight with a shield. Madeline is a princess with long hair. Francis hears about a dragon terrorizing the kingdom. He goes to the castle to kill the dragon in an epic battle. The princess is angry because the dragon was her friend.",
    "Adrien is a guy with blond hair. Vincent is a guy with black hair. Adrien and Vincent work at the office and want to start a new product. They create it in one night before presenting it to the board.",
    "Peter is a tall guy with blond hair. Steven is a small guy with black hair. Peter and Steven walk together in New York when aliens attack the city. They are afraid and try to run for their lives. The army arrives and saves them.",
    "Lily is a little girl with curly brown hair. Her cat, Muffin, has soft white fur. Lily and Muffin explore a magical garden filled with glowing flowers and gentle animals. As the sun sets, they find a cozy spot under a tree to watch the stars and drift off to sleep.",
    "Sam and Alex are best friends who discover a hidden cave on a mountain hike. Inside, they find ancient artifacts and a map that leads to a lost treasure. They embark on an adventurous journey to uncover the treasure’s secrets.",
    "Mia, an aspiring detective, stumbles upon a mysterious notebook with clues about an unsolved crime. With her friend Jake, they decide to follow the clues and unravel the mystery piece by piece.",
    "Emma is a brilliant scientist, and Leo is her adventurous friend. They accidentally invent a machine that allows them to travel through time. They visit different eras, meeting historical figures and learning valuable lessons along the way."
  ];

  const styles = ["Anime", "Belgium Comic", "Manga", "American Comic", "Bedtime E-Book"];
  const languages = ["English", "Chinese", "Thailand", "Japanese"];
  const layouts = [1,2];

  const countWords = (text: string) => text.trim().split(/\s+/).length;
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Cycle to the next example scenario
  const handleNextExample = () => {
    const nextIndex = (exampleIndex + 1) % scenarioExamples.length;
    setExampleIndex(nextIndex);
    setScenario(scenarioExamples[nextIndex]);
  };

  const handleScenarioChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setScenario(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !scenario || !style || !language || !layout) {
      toast.error("All fields must be filled.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const wordCount = countWords(scenario);
    if (wordCount < 10 || wordCount > 300) {
      toast.error("Scenario must be between 10 and 300 words.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Generating comic... Please wait.");

    try {
      const response = await fetch(`${API_URL}/send_comic_email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, style, email, language,layout }),
      });

      const data = await response.json();
      if (data.download_url) {
        setDownloadLink(`${API_URL}${data.download_url}`);
        toast.success("Comic generated successfully!", { id: loadingToastId });
      }
      if (data.view_url) setViewLink(`${API_URL}${data.view_url}`);
    } catch (error) {
      console.error('Error generating the comic:', error);
      toast.error("Failed to generate the comic.", { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      {/* <Header /> */}
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">Try Moonlit Beta</h1>

        <section className="text-center mb-8 px-4">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to Moonlit Beta! Experience our AI-driven comic generator.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
      <label htmlFor="scenario" className="block text-sm font-medium mb-2">
        Scenario (10-300 words)
      </label>

      {/* Editable Text Area */}
      <textarea
        id="scenario"
        value={scenario}
        onChange={handleScenarioChange}
        className="mb-2 w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
        rows={5}
      />

      <div className="text-center mt-2">
        {/* Icon Button for Next Example */}
        <FiRefreshCw 
          onClick={handleNextExample} 
          className="cursor-pointer inline-block text-3xl text-blue-500 hover:text-blue-600 transition duration-300"
          title="Next Example"
        />
      </div>
    </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium mb-2">Style</label>
            <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="">Select Style</option>
              {styles.map((styleOption) => (
                <option key={styleOption} value={styleOption}>{styleOption}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-2">Language</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="">Select Language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="layout" className="block text-sm font-medium mb-2">Layout</label>
            <select id="layout" value={layout} onChange={(e) => setLayout(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="">Select Layout</option>
              {layouts.map((layoutOption) => (
                <option key={layoutOption} value={layoutOption}>{layoutOption}</option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Stories'}
          </Button>
        </form>

        {downloadLink && (
          <div className="mt-8 text-center">
            <a href={downloadLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Download your comic here </a><br />
            {viewLink && (
              <button className="text-blue-500 underline mt-4" onClick={() => setShowModal(true)}>View your comic</button>
            )}
          </div>
        )}
      </main>

      <Modal showModal={showModal} onClose={() => setShowModal(false)} pdfUrl={viewLink || ''} />
      <Footer />
    </div>
  );
}
