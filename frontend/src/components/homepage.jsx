import React from "react";
import { Button } from "./Button.jsx";
import { ArrowRight, Sparkles, Layers, Brain, MousePointer2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0e1217] text-white">
      {/* Background Glow Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-purple-500/25 blur-[180px]" />
        <div className="absolute bottom-0 right-[-10%] h-[24rem] w-[24rem] rounded-full bg-blue-500/20 blur-[160px]" />
        <div className="absolute top-1/3 left-[-10%] h-64 w-64 rounded-full bg-emerald-400/15 blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-28 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-200">
          <Sparkles size={14} className="text-purple-300" />
          AI Knowledge Graphs
        </span>
        <h1 className="mb-5 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
          Explore Any Topic with <span className="text-purple-300">AI-Powered Trees</span>
        </h1>
        <p className="mb-10 max-w-3xl text-lg text-gray-300">
          Generate, expand, and dive deep into interactive knowledge graphs. Get definitions, examples, interviews prep, and more—styled to match the rest of the app.
        </p>

        {/* Topic Input - Signed In Only */}
        <SignedIn>
          <div className="glassmorphism mb-6 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <input
              id="topic-input"
              className="w-full rounded-xl bg-transparent px-4 py-3 text-white outline-none placeholder-gray-400"
              placeholder="Enter a topic… (e.g., React Hooks, Docker, OS Scheduling)"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const topic = e.target.value.trim();
                  navigate(`/explore?topic=${encodeURIComponent(topic)}`);
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.getElementById('topic-input');
                const topic = input?.value?.trim();
                if (topic) {
                  navigate(`/explore?topic=${encodeURIComponent(topic)}`);
                } else {
                  navigate('/explore');
                }
              }}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 text-base hover:from-purple-400 hover:to-blue-400"
            >
              Explore <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </SignedIn>

        {/* CTA Buttons */}
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <SignedIn>
            <Button
              onClick={() => navigate('/explore')}
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-4 text-base backdrop-blur-xl hover:bg-white/15"
            >
              Go to Dashboard
            </Button>
          </SignedIn>
          <SignedOut>
            <Button
              onClick={() => navigate('/sign-in')}
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-4 text-base backdrop-blur-xl hover:bg-white/15"
            >
              Try Demo
            </Button>
            <Button
              onClick={() => navigate('/sign-in')}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-4 text-base hover:from-purple-400 hover:to-blue-400"
            >
              Login
            </Button>
          </SignedOut>
        </div>

        {/* Stats strip */}
        <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Topics explored", value: "25k+" },
            { label: "Subtopics generated", value: "180k+" },
            { label: "Avg. time saved", value: "65%" },
            { label: "Teams onboarded", value: "1.2k+" },
          ].map((item) => (
            <div
              key={item.label}
              className="glassmorphism flex flex-col items-center rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-gray-200 backdrop-blur-xl"
            >
              <span className="text-lg font-semibold text-white">{item.value}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="flex items-center justify-between gap-4 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Product pillars</p>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">Why Interview Tree AI?</h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300 md:block">
            Built for engineers, learners, and interview prep.
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <Layers className="h-6 w-6 text-purple-300" />,
              title: "Dynamic AI Topic Expansion",
              desc: "Each topic expands into AI-generated subtopics, building an infinite, navigable tree.",
            },
            {
              icon: <Brain className="h-6 w-6 text-blue-300" />,
              title: "Deep Explanations",
              desc: "Open any node for definitions, examples, best practices, and interview Q&A.",
            },
            {
              icon: <Sparkles className="h-6 w-6 text-emerald-300" />,
              title: "Elegant Experience",
              desc: "Glassmorphism styling, smooth animations, and fast interactions that mirror the explore page.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="glassmorphism group flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">{f.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Workflow</p>
        <h2 className="mb-6 text-3xl font-semibold text-white md:text-4xl">
          How It Works
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Step number="1" text="Enter any topic — AI generates the root concept." />
          <Step number="2" text="Expand nodes to reveal deeper related subtopics." />
          <Step number="3" text="Click node centers to read detailed explanations." />
          <Step number="4" text="Explore recursively until mastery-level understanding." />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 mx-auto mb-20 max-w-4xl px-6 text-center">
        <div className="glassmorphism rounded-3xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-xl">
          <h2 className="mb-3 text-3xl font-semibold">Start Exploring Knowledge</h2>
          <p className="mb-8 text-gray-300">
            Turn any concept into a structured, AI-powered learning journey with the same polished UI as the explorer.
          </p>
          <Button
            onClick={() => navigate('/explore')}
            className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 text-lg hover:from-purple-400 hover:to-blue-400"
          >
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}

// Step Component
function Step({ number, text }) {
  return (
    <div className="glassmorphism mx-auto flex h-full max-w-xl items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl text-left">
      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
        {number}
      </span>
      <p className="text-base text-gray-200">{text}</p>
    </div>
  );
}
