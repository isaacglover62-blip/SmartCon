import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/auth.service'

const schema = z.object({ email: z.string().email('Invalid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      await authService.resetPassword(data.email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }}>
          <img src="/smartcon-logo.png" alt="SmartCon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Reset password</Typography>
        <Typography color="text.secondary">Enter your email to receive a reset link</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {sent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Check your inbox — a password reset link has been sent to your email.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} autoComplete="email" />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
              </Button>
            </Box>
          )}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowBack fontSize="small" /> Back to sign in
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
