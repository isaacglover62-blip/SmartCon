import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Divider,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authService.login(data.email, data.password)
      setAuth(res.user, res.accessToken, res.refreshToken)
      toast.success(`Welcome back, ${res.user.firstName}!`)
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password'
      toast.error(msg)
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
        <Typography variant="h4" fontWeight={700} gutterBottom>Welcome back</Typography>
        <Typography color="text.secondary">Sign in to your SmartHome dashboard</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ textAlign: 'right', mt: -1 }}>
              <Link to="/forgot-password" style={{ color: '#6366f1', textDecoration: 'none', fontSize: 14 }}>
                Forgot password?
              </Link>
            </Box>

            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
