// app/not-found.tsx

import Link from "next/link";

/**
 * A custom Not Found (404) page component with a Spartan theme.
 */
export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/images/spartan-background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-10 rounded-lg shadow-2xl backdrop-blur-sm bg-gray-800/80 text-center border-4 border-amber-600">
        {/* The Error Code */}
        <h1 className="text-9xl font-extrabold text-red-600 mb-4">404</h1>

        {/* Spartan-themed Heading */}
        <h2 className="text-4xl sm:text-5xl font-serif tracking-widest uppercase text-amber-500 mb-6 border-b-2 border-amber-600 pb-3">
          This Is Not Sparta!
        </h2>

        {/* The Error Message */}
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">
          The passage you sought has been lost to the fog of war. No legion, no
          citizen, no oracle knows of this place.
        </p>

        {/* Call to Action */}
        <Link
          href="/"
          className="px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider rounded-md transition duration-300 shadow-lg transform hover:scale-105"
        >
          Return to the Acropolis (Home)
        </Link>
      </div>

      {/* Optional: Add a placeholder for a Spartan helmet icon or image */}
      <div className="mt-8 text-4xl text-amber-500" title="Spartan Helmet Icon">
        🛡️
      </div>
    </div>
  );
}

// NOTE: For the background image to work, you would need to place an image
// named 'spartan-background.jpg' inside your 'public/images' folder.
