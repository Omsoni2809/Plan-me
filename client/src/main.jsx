import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <SignedIn>
        {/* We removed the ugly top bar from here. The UserButton is now in App.jsx! */}
        <App />
      </SignedIn>
      
      <SignedOut>
        {/* Beautiful Custom Auth Page Background */}
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4 font-sans">
          
          {/* Custom Branding Above the Login Box */}
          <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight mb-2">
              Plan Me
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Smart AI-powered calendar & task manager
            </p>
          </div>

          {/* Clerk Component with Custom Tailwind Injections */}
          <div className="animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both shadow-2xl rounded-2xl overflow-hidden">
            <SignIn 
              routing="hash" 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl",
                  headerTitle: "text-gray-900 dark:text-gray-100 font-bold",
                  headerSubtitle: "text-gray-500",
                  socialButtonsBlockButton: "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors",
                  dividerLine: "bg-gray-200 dark:bg-gray-700",
                  dividerText: "text-gray-500",
                  formFieldLabel: "text-gray-700 dark:text-gray-300 font-medium",
                  formFieldInput: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 rounded-lg",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
                  footerActionText: "text-gray-500",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold"
                }
              }} 
            />
          </div>
        </div>
      </SignedOut>
    </ClerkProvider>
  </React.StrictMode>
);