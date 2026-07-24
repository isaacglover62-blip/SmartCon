import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

function sessionToUser(session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } }): User {
  const meta = session.user.user_metadata ?? {}
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    firstName: meta['first_name'] ?? meta['firstName'] ?? 'User',
    lastName: meta['last_name'] ?? meta['lastName'] ?? '',
    role: 'USER',
  }
}

export const authService = {
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { first_name: data.firstName, last_name: data.lastName },
      },
    })
    if (error) throw new Error(error.message)
    if (!result.session) throw new Error('Check your email to confirm your account before signing in.')
    return {
      user: sessionToUser(result.session),
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
    }
  },

  async login(email: string, password: string) {
    const { data: result, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    if (!result.session) throw new Error('Login failed')
    return {
      user: sessionToUser(result.session),
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
    }
  },

  async logout() {
    await supabase.auth.signOut()
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  },

  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    if (error || !data.session) return null
    return {
      user: sessionToUser(data.session),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  },
}
