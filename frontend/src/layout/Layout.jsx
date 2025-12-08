import "react"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Outlet, Link, Navigate } from "react-router-dom"
import { Brain } from "lucide-react"

export function Layout() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-fuchsia-200 backdrop-blur-sm shadow-sm">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        
                        {/* Logo & Brand */}
                        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition group">
                            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                                <Brain size={20} className="text-white" />
                            </div>
                            <span className="text-lg">Interview Tree AI</span>
                        </Link>

                        {/* Navigation */}
                        {/* <nav className="flex items-center gap-8">
                            <SignedIn>
                                
                            </SignedIn>
                        </nav> */}

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <SignedIn>
                                {/* <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                                    Home
                                </Link> */}
                                <UserButton />
                            </SignedIn>
                            <SignedOut>
                                <Link to="/sign-in" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                                    Sign In
                                </Link>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <SignedOut>
                    <Navigate to="/sign-in" replace />
                </SignedOut>
                <SignedIn>
                    <Outlet />
                </SignedIn>
            </main>

            {/* Footer */}
            {/* <footer className="border-t border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="text-center text-sm text-gray-600">
                        <p>© 2025 Interview Tree AI. Explore knowledge trees with AI.</p>
                    </div>
                </div>
            </footer> */}
        </div>
    )
}