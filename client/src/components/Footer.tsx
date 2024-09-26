import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* About Section */}
        <div>
          <h3 className="text-white text-lg font-bold mb-4">About ComicDreams</h3>
          <p className="text-gray-400">
            ComicDreams brings your favorite comic characters to life. Our platform allows users to create and share comic strips using AI-generated illustrations, making it easy to turn imagination into reality.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
          <div className="flex flex-col space-y-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/features" className="hover:text-white">Features</Link>
            <Link href="/testimonials" className="hover:text-white">Testimonials</Link>
            <Link href="/try-beta" className="hover:text-white">Try Beta</Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom Text */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p>© 2024 ComicDreams | All Rights Reserved</p>
      </div>
    </footer>
  );
}
