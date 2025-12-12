 // app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to ShipMVP
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-courier shipping aggregator platform
        </p>
        <div className="space-x-4">
          <Link
            href="/auth"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
