// app/page.tsx
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-black text-white font-sans">
      {/* Animated background layers */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#07133a] to-[#001219] animate-bg-tilt opacity-80" />
        <div className="absolute -left-10 -top-20 w-[60rem] h-[60rem] bg-gradient-to-r from-[#ff2d95] to-[#7c3aed] opacity-20 blur-3xl animate-blob" />
        <div className="absolute right-0 bottom-0 w-[50rem] h-[50rem] bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] opacity-18 blur-2xl animate-blob delay-2000" />
      </div>

      {/* Page container */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Top bar */}
        <header className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-black flex items-center justify-center text-xl font-bold rounded-none shadow-lg">
              NF
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Notefinery</h1>
              <p className="text-xs text-gray-300 -mt-1">Study smarter • Create faster</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 bg-transparent border border-white text-white rounded-none font-medium hover:bg-white/10">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 bg-white text-black rounded-none font-semibold hover:opacity-90">
                  Get started
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-white text-black rounded-none font-semibold hover:opacity-90">
                  Dashboard
                </button>
              </Link>
            </SignedIn>
          </nav>
        </header>

        {/* Hero */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Capture ideas. Convert to flashcards. Crush exams.
            </h2>
            <p className="text-lg text-gray-300 max-w-xl">
              A bold, no-nonsense study tool for students who want to learn faster. Square design, aggressive performance, AI-powered flashcards — built for the hustle.
            </p>

            <div className="flex flex-wrap gap-3">
              <SignUpButton>
                <button className="px-6 py-3 bg-white text-black rounded-none font-bold shadow-lg transform hover:-translate-y-0.5 transition">
                  Try it free
                </button>
              </SignUpButton>

              <Link href="/features">
                <button className="px-6 py-3 border border-white text-white rounded-none font-semibold hover:bg-white/6">
                  See features
                </button>
              </Link>

              <Link href="/learn-more" className="ml-2">
                <button className="px-4 py-3 bg-transparent border border-white/20 text-white rounded-none text-sm">
                  How it works
                </button>
              </Link>
            </div>

            <div className="flex gap-4 text-sm text-gray-300 mt-2">
              <span className="inline-flex items-center gap-2">
                <strong className="text-white">Instant</strong> capture & sync
              </span>
              <span className="inline-flex items-center gap-2">AI-curated flashcards</span>
              <span className="inline-flex items-center gap-2">Exportable sets</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md h-96 bg-white/6 border border-white/8 rounded-none p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-white/8 rounded-none" />
                <div className="text-xs text-gray-300">Live preview</div>
              </div>

              <div className="flex-1 grid gap-3 auto-rows-max overflow-hidden">
                {/* Mock preview cards */}
                {["Photosynthesis", "Newton's 2nd Law", "Cell Structure", "Quantum Tunnelling"].map((t, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/6 rounded-none">
                    <div className="font-semibold text-white">{t}</div>
                    <div className="text-sm text-gray-300 mt-2 line-clamp-3">
                      Example flashcard content: concise, actionable, and ready for review. Tap generate to produce a full set.
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3">
                <div className="text-xs text-gray-400">Preview</div>
                <div className="text-xs text-gray-300">8 cards • 2 min read</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Fast Capture", desc: "Save notes instantly. No friction.", emoji: "⚡" },
            { title: "AI Flashcards", desc: "Turn notes into study-ready cards.", emoji: "🧠" },
            { title: "Offline Ready", desc: "Study anywhere, anytime.", emoji: "📱" }
          ].map((f, i) => (
            <div key={i} className="p-6 bg-white/4 border border-white/6 rounded-none">
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 font-bold text-xl">{f.title}</h3>
              <p className="mt-2 text-gray-300">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-white/6 text-sm text-gray-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} Notefinery — built for students who grind.
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </footer>
      </div>

      {/* Scoped animation styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes bgtilt {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-blob { animation: blob 9s ease-in-out infinite; }
        .animate-blob.delay-2000 { animation-delay: 2s; }
        .animate-bg-tilt { background-size: 200% 200%; animation: bgtilt 12s linear infinite; }

        /* Utility: subtle opacity numbers */
        .opacity-18 { opacity: 0.18; }
      `}</style>
    </main>
  );
}
