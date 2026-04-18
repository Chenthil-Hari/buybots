import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ProjectProvider } from './context/ProjectContext'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY} 
            afterSignOutUrl="/"
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: '#fcd34d', // Amber-300 to match Buy-Bots theme
                    colorBackground: '#111827',
                    colorText: '#f3f4f6',
                }
            }}
        >
            <AuthProvider>
                <ProjectProvider>
                    <App />
                </ProjectProvider>
            </AuthProvider>
        </ClerkProvider>
    </StrictMode>,
)
