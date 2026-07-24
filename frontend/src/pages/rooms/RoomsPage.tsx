import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, IconButton, Chip,
} from '@mui/material'
import { Add, Delete, Edit, MeetingRoom } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHomeStore } from '@/store/homeStore'
import { homeService } from '@/services/home.service'
import toast from 'react-hot-toast'

const ROOM_ICONS = ['living_room', 'bedroom', 'kitchen', 'bathroom', 'garage', 'office', 'garden', 'dining_room']
const ROOM_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#14b8a6']

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  icon: z.string().default('room'),
  color: z.string().default('#6366f1'),
  floor: z.number().int().min(0).max(10).default(1),
})
type FormData = z.infer<typeof schema>

export function RoomsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { rooms, devices, activeHomeId, setRooms, addRoom, removeRoom } = useHomeStore()

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { icon: 'room', color: '#6366f1', floor: 1 },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (activeHomeId) {
      homeService.getRooms(activeHomeId).then(setRooms).catch(() => {})
    }
  }, [activeHomeId])

  const onSubmit = async (data: FormData) => {
    if (!activeHomeId) return toast.error('No home selected')
    setSaving(true)
    try {
      const room = await homeService.createRoom(activeHomeId, data)
      addRoom(room)
      setDialogOpen(false)
      reset()
      toast.success(`Room "${room.name}" created!`)
    } catch {
      toast.error('Failed to create room')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (roomId: string, name: string) => {
    if (!activeHomeId) return
    if (!confirm(`Delete room "${name}"?`)) return
    try {
      await homeService.deleteRoom(activeHomeId, roomId)
      removeRoom(roomId)
      toast.success('Room deleted')
    } catch {
      toast.error('Failed to delete room')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Rooms</Typography>
          <Typography color="text.secondary" variant="body2">{rooms.length} rooms configured</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Add Room</Button>
      </Box>

      {rooms.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MeetingRoom sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No rooms yet</Typography>
            <Typography color="text.secondary" gutterBottom>Create rooms to organize your devices</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ mt: 2 }}>Create Room</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {rooms.map((room) => {
            const roomDevices = devices.filter((d) => d.roomId === room.id)
            const onlineCount = roomDevices.filter((d) => d.online).length
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                <Card sx={{ borderLeft: `4px solid ${room.color}`, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{room.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Floor {room.floor}</Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleDelete(room.id, room.name)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`${roomDevices.length} devices`} />
                      {onlineCount > 0 && <Chip size="small" label={`${onlineCount} online`} color="success" />}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Room</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Room Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <Controller
              name="floor"
              control={control}
              render={({ field }) => (
                <TextField label="Floor" type="number" fullWidth {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} inputProps={{ min: 0, max: 10 }} />
              )}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>Color</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {ROOM_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setValue('color', color)}
                    sx={{
                      width: 32, height: 32, borderRadius: '50%', bgcolor: color,
                      cursor: 'pointer', border: selectedColor === color ? '3px solid white' : '3px solid transparent',
                      boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); reset() }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Create Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
