// app/components/Header.tsx
"use client"

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { clearToken, selectAuth } from '@/lib/store/features/user/user';

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector(selectAuth);
  const isLoggedIn = !!auth.token;

  const handleLogout = () => {
    dispatch(clearToken()); // Clear the token from Redux store
    router.replace('/'); // Redirect to login/home page
  };

  return (
    <header className="container mx-auto py-6">
      <nav className="flex justify-between items-center">
        <div className="text-2xl font-bold">Moonlit</div>
        <div className="space-x-4">
          <Link href="/" className="text-sm font-medium hover:underline">Home</Link>
          <Link href="/features" className="text-sm font-medium hover:underline">Features</Link>
          <Link href="/testimonials" className="text-sm font-medium hover:underline">Testimonials</Link>
          <Link href="/try-beta" className="text-sm font-medium hover:underline">Try Beta</Link>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-sm font-medium hover:underline text-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
