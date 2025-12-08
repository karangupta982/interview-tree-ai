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
      <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/30 blur-[160px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[180px]" />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-32 text-center">
        
        {/* Title */}
        <h1 className="mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
          Explore Any Topic with <span className="text-purple-300">AI-Powered Knowledge Trees</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-2xl text-lg text-gray-300">
          Type a topic and watch AI create an expanding knowledge map: subtopics, explanations, interviews insights, and more.
        </p>

        {/* Topic Input - Signed In Only */}
        <SignedIn>
          <div className="glassmorphism mb-8 flex w-full max-w-lg items-center rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
            <input
              id="topic-input"
              className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder-gray-400"
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
              className="ml-2 rounded-xl bg-purple-600 px-6 py-5 hover:bg-purple-700"
            >
              Explore <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </SignedIn>

        {/* CTA Buttons */}
        <div className="mt-4 flex gap-4">
          <SignedIn>
            <Button 
              onClick={() => navigate('/explore')}
              className="rounded-xl bg-purple-600 px-6 py-5 hover:bg-purple-700"
            >
              Go to Dashboard
            </Button>
          </SignedIn>
          <SignedOut>
            <Button 
              onClick={() => navigate('/sign-in')}
              className="rounded-xl bg-white/10 px-6 py-5 backdrop-blur-xl hover:bg-white/20"
            >
              Try Demo
            </Button>
            <Button 
              onClick={() => navigate('/sign-in')}
              className="rounded-xl bg-purple-600 px-6 py-5 hover:bg-purple-700"
            >
              Login
            </Button>
          </SignedOut>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 mx-auto mt-32 max-w-6xl px-6">
        <h2 className="mb-12 text-center text-3xl font-semibold text-white md:text-4xl">
          Why Interview Tree AI?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Feature 1 */}
          <div className="glassmorphism group flex flex-col items-start rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-2 hover:bg-white/10">
            <div className="mb-4 rounded-2xl bg-purple-500/20 p-4">
              <Layers className="h-7 w-7 text-purple-300" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Dynamic AI Topic Expansion</h3>
            <p className="text-gray-300">
              Each topic expands into AI-generated subtopics, building a smart, infinite knowledge tree.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glassmorphism group flex flex-col items-start rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-2 hover:bg-white/10">
            <div className="mb-4 rounded-2xl bg-blue-500/20 p-4">
              <Brain className="h-7 w-7 text-blue-300" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Deep Explanations</h3>
            <p className="text-gray-300">
              Click any node to reveal definitions, examples, best practices, and interview questions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glassmorphism group flex flex-col items-start rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-2 hover:bg-white/10">
            <div className="mb-4 rounded-2xl bg-green-500/20 p-4">
              <Sparkles className="h-7 w-7 text-green-300" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Beautiful Interactive UI</h3>
            <p className="text-gray-300">
              Smooth animations, glassmorphism styling, and intuitive user interactions.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto mt-32 max-w-4xl px-6 text-center">
        <h2 className="mb-8 text-3xl font-semibold text-white md:text-4xl">
          How It Works
        </h2>

        <div className="space-y-8">
          <Step number="1" text="Enter any topic — AI generates the root concept." />
          <Step number="2" text="Expand nodes to reveal deeper related subtopics." />
          <Step number="3" text="Click node centers to read detailed explanations." />
          <Step number="4" text="Explore recursively until mastery level understanding." />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 mx-auto mt-32 mb-20 max-w-xl px-6 text-center">
        <h2 className="mb-6 text-3xl font-semibold">Start Exploring Knowledge</h2>
        <p className="mb-8 text-gray-300">Turn any concept into a structured, AI-powered learning journey.</p>
        <Button 
          onClick={() => navigate('/explore')}
          className="rounded-xl bg-purple-600 px-8 py-6 text-lg hover:bg-purple-700"
        >
          Get Started
        </Button>
      </section>
    </div>
  );
}

// Step Component
function Step({ number, text }) {
  return (
    <div className="glassmorphism mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-lg text-gray-200">
        <span className="mr-2 rounded-xl bg-purple-500/30 px-3 py-1 text-white">{number}</span>
        {text}
      </p>
    </div>
  );
}
