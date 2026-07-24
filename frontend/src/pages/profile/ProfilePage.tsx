import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Avatar, Button,
  TextField, Grid, Divider, Chip, CircularProgress,
} from '@mui/material'
import { Edit, Save, Cancel, Person, Email, Shield } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    updateUser(form)
    setSaving(false)
    setEditing(false)
    toast.success('Profile updated!')
  }

  const handleSignOut = async () => {
    await authService.logout()
    logout()
    toast.success('Signed out')
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Profile</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, mb: 3, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, fontSize: 28, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>{user?.firstName} {user?.lastName}</Typography>
              <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
              <Chip size="small" icon={<Shield fontSize="small" />} label={user?.role ?? 'USER'} color="primary" sx={{ mt: 0.5 }} />
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="First Name" fullWidth value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Last Name" fullWidth value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} onClick={handleSave} disabled={saving}>Save</Button>
                <Button startIcon={<Cancel />} onClick={() => setEditing(false)}>Cancel</Button>
              </Box>
            </Box>
          ) : (
            <Box>
              {[
                { icon: <Person />, label: 'Name', value: `${user?.firstName} ${user?.lastName}` },
                { icon: <Email />, label: 'Email', value: user?.email },
              ].map(({ icon, label, value }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={500} noWrap>{value}</Typography>
                  </Box>
                </Box>
              ))}
              <Button startIcon={<Edit />} onClick={() => setEditing(true)} sx={{ mt: 2 }}>Edit Profile</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Account</Typography>
          <Button variant="outlined" color="error" onClick={handleSignOut} fullWidth>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
