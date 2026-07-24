import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Card, CardContent, TextField, Button, Typography, Grid,
  CircularProgress, InputAdornment, IconButton, Divider,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  firstName: z.string().min(1, 'First name required').max(100),
  lastName: z.string().min(1, 'Last name required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
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
      const res = await authService.register(data)
      setAuth(res.user, res.accessToken, res.refreshToken)
      toast.success('Account created! Welcome to SmartHome.')
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
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
        <Typography variant="h4" fontWeight={700} gutterBottom>Create account</Typography>
        <Typography color="text.secondary">Join SmartHome BLE today</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="First Name" fullWidth {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Last Name" fullWidth {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} />
              </Grid>
            </Grid>
            <TextField label="Email" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField
              label="Password" type={showPassword ? 'text' : 'password'} fullWidth
              {...register('password')} error={!!errors.password} helperText={errors.password?.message}
              slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
            />
            <TextField label="Confirm Password" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
