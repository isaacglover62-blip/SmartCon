import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useThemeStore } from '@/store/themeStore'
import { createAppTheme } from '@/theme'
import { AppRouter } from '@/router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { SplashScreen } from '@/components/pwa/SplashScreen'

function sessionToUser(session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } }) {
  const meta = session.user.user_metadata ?? {}
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    firstName: meta['first_name'] ?? meta['firstName'] ?? 'User',
    lastName: meta['last_name'] ?? meta['lastName'] ?? '',
    role: 'USER' as const,
  }
}

export default function App() {
  const { mode } = useThemeStore()
  const theme = createAppTheme(mode)
  const { setAuth, logout } = useAuthStore()
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    // On mount, sync from real Supabase session if one exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(sessionToUser(session), session.access_token, session.refresh_token)
      }
      // If no Supabase session, leave persisted store state untouched
      // (user stays logged in with stored token until explicit sign-out)
    })

    // React only to explicit sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuth(sessionToUser(session), session.access_token, session.refresh_token)
      } else if (event === 'SIGNED_OUT') {
        logout()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setAuth(sessionToUser(session), session.access_token, session.refresh_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <InstallPrompt />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: mode === 'dark' ? '#1e1e2e' : '#ffffff',
            color: mode === 'dark' ? '#cdd6f4' : '#1e1e2e',
            border: '1px solid rgba(99,102,241,0.3)',
          },
        }}
      />
    </ThemeProvider>
  )
}
