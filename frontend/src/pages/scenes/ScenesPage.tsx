import { useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Button, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, IconButton,
} from '@mui/material'
import { Add, Delete, PlayArrow, MovieFilter } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { bleService } from '@/services/ble.service'
import { useBLEStore } from '@/store/bleStore'
import toast from 'react-hot-toast'

interface Scene {
  id: string
  name: string
  icon: string
  color: string
  commands: string[]
}

const PRESET_SCENES: Scene[] = [
  { id: 'movie', name: 'Movie Night', icon: '🎬', color: '#6366f1', commands: ['LIGHT_1_OFF', 'LIGHT_2_OFF', 'LIGHT_3_ON', 'FAN_1'] },
  { id: 'morning', name: 'Good Morning', icon: '☀️', color: '#f59e0b', commands: ['LIGHT_1_ON', 'LIGHT_2_ON', 'CURTAIN_OPEN', 'FAN_0'] },
  { id: 'sleep', name: 'Sleep Mode', icon: '🌙', color: '#1e1b4b', commands: ['ALL_OFF'] },
  { id: 'party', name: 'Party Mode', icon: '🎉', color: '#ec4899', commands: ['RGB_255_0_0', 'LIGHT_1_ON', 'FAN_2'] },
  { id: 'work', name: 'Work Focus', icon: '💼', color: '#10b981', commands: ['LIGHT_1_ON', 'LIGHT_2_ON', 'FAN_1'] },
  { id: 'alloff', name: 'All Off', icon: '🔌', color: '#64748b', commands: ['ALL_OFF'] },
]

const schema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().default('⚡'),
  color: z.string().default('#6366f1'),
  commands: z.string(),
})
type FormData = z.infer<typeof schema>

export function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>(PRESET_SCENES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const { status } = useBLEStore()
  const isConnected = status === 'connected'

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { icon: '⚡', color: '#6366f1', commands: '' },
  })

  const activateScene = async (scene: Scene) => {
    if (!isConnected) return toast.error('No BLE device connected')
    setActivating(scene.id)
    try {
      for (const cmd of scene.commands) {
        await bleService.sendCommand(cmd as never)
        await new Promise((r) => setTimeout(r, 300))
      }
      toast.success(`Scene "${scene.name}" activated!`)
    } catch {
      toast.error('Scene activation failed')
    } finally {
      setActivating(null)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    const newScene: Scene = {
      id: Date.now().toString(),
      name: data.name,
      icon: data.icon,
      color: data.color,
      commands: data.commands.split(',').map((c) => c.trim()).filter(Boolean),
    }
    setScenes((prev) => [...prev, newScene])
    setSaving(false)
    setDialogOpen(false)
    reset()
    toast.success('Scene created!')
  }

  const handleDelete = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id))
    toast.success('Scene deleted')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Scenes</Typography>
          <Typography color="text.secondary" variant="body2">Activate multiple devices with one tap</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>New Scene</Button>
      </Box>

      <Grid container spacing={2}>
        {scenes.map((scene) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={scene.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, fontSize: 24, bgcolor: scene.color + '30' }}>
                    {scene.icon}
                  </Avatar>
                  <IconButton size="small" color="error" onClick={() => handleDelete(scene.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>{scene.name}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {scene.commands.map((cmd) => (
                    <Chip key={cmd} label={cmd} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                  ))}
                </Box>
                <Button
                  fullWidth variant="contained"
                  startIcon={activating === scene.id ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
                  onClick={() => activateScene(scene)}
                  disabled={!isConnected || activating !== null}
                  sx={{ bgcolor: scene.color, '&:hover': { bgcolor: scene.color, filter: 'brightness(0.9)' } }}
                >
                  {activating === scene.id ? 'Activating...' : 'Activate'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Scene</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Scene Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Emoji Icon" fullWidth {...register('icon')} placeholder="⚡" />
            <TextField label="Color (hex)" fullWidth {...register('color')} placeholder="#6366f1" />
            <TextField
              label="Commands (comma-separated)"
              fullWidth multiline rows={3}
              {...register('commands')}
              placeholder="LIGHT_1_ON, FAN_1, CURTAIN_OPEN"
              helperText="BLE commands to send in sequence"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); reset() }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Create Scene'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
