
"use client";
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
// import ContactSection from '@/components/ContactSection';
import CTASection from '@/components/CTASection';
import '../styles/global.css'; // Import your global CSS file



import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import { setToken } from "@/lib/store/features/user/user";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isTokenVerified, setIsTokenVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const pathname = window.location.pathname;

      // Skip token verification and redirection for certain paths
      if (pathname.startsWith("/reset-password/") || pathname.startsWith("/complete-signup/")) {
        setIsTokenVerified(true);
        return;
      }

      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            localStorage.removeItem("token");
            router.replace("/");
            return;
          }

          dispatch(setToken(token));
          router.replace("/");
        } catch (error) {
          console.error("Token verification error:", error);
          localStorage.removeItem("token");
          router.replace("/login");
        }
      } else {
        router.replace("/");
      }

      setIsTokenVerified(true);
    };

    verifyToken();
  }, [router, dispatch]);

  if (!isTokenVerified) {
    // Show nothing or a loading spinner while token is being verified
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <Header /> */}
      <main className="container mx-auto px-4 py-12 space-y-24">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        {/* <ContactSection /> */}
        <CTASection />
      </main>
      <footer className="container mx-auto py-6 text-center text-muted-foreground">
        <p>&copy; 2024 Moonlit. All rights reserved.</p>
      </footer>
    </div>
  );
}
