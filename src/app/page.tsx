import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white text-center px-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
        This is my Personal Data Repository for APIs.
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-2xl">
        Explore the structured, and reliable data sources that I personally use
        to build and support the projects in my portfolio.
      </p>
      <p className="text-gray-400 text-lg mb-8 max-w-2xl">
        - Salvador Martinez
      </p>
      <Link
        href="/admin"
        className="px-16 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-semibold transition-all duration-200"
      >
        Start
      </Link>
    </main>
  )
}
