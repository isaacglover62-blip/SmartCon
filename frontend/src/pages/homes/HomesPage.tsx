import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, IconButton, Chip, Avatar,
} from '@mui/material'
import { Add, Delete, Home, Check } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHomeStore } from '@/store/homeStore'
import { homeService } from '@/services/home.service'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().default('UTC'),
})
type FormData = z.infer<typeof schema>

export function HomesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { homes, activeHomeId, setHomes, addHome, removeHome, setActiveHome } = useHomeStore()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: 'UTC' },
  })

  useEffect(() => {
    homeService.getHomes().then(setHomes).catch(() => {})
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const home = await homeService.createHome(data)
      addHome(home)
      if (!activeHomeId) setActiveHome(home.id)
      setDialogOpen(false)
      reset()
      toast.success(`Home "${home.name}" created!`)
    } catch {
      toast.error('Failed to create home')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete home "${name}" and all its data?`)) return
    try {
      await homeService.deleteHome(id)
      removeHome(id)
      toast.success('Home deleted')
    } catch {
      toast.error('Failed to delete home')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>My Homes</Typography>
          <Typography color="text.secondary" variant="body2">{homes.length} home{homes.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Add Home</Button>
      </Box>

      {homes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Home sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No homes yet</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ mt: 2 }}>Create First Home</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {homes.map((home) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={home.id}>
              <Card sx={{ cursor: 'pointer', border: home.id === activeHomeId ? '2px solid' : undefined, borderColor: 'primary.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}><Home /></Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{home.name}</Typography>
                        {home.address && <Typography variant="caption" color="text.secondary">{home.address}</Typography>}
                      </Box>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDelete(home.id, home.name)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  {home.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{home.description}</Typography>}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip size="small" label={home.timezone} />
                    {home.id === activeHomeId ? (
                      <Chip size="small" icon={<Check fontSize="small" />} label="Active" color="primary" />
                    ) : (
                      <Button size="small" onClick={() => setActiveHome(home.id)}>Set Active</Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Home</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Home Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Description (Optional)" fullWidth multiline rows={2} {...register('description')} />
            <TextField label="Address (Optional)" fullWidth {...register('address')} />
            <TextField label="Timezone" fullWidth {...register('timezone')} placeholder="UTC" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); reset() }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Create Home'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
