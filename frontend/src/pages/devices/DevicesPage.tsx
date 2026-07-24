import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Button, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, IconButton, Fab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert,
} from '@mui/material'
import { Add, Search, FilterList, Refresh } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DeviceCard } from '@/components/devices/DeviceCard'
import { homeService } from '@/services/home.service'
import { useHomeStore } from '@/store/homeStore'
import toast from 'react-hot-toast'
import type { DeviceType } from '@/types'

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: 'LIGHT', label: 'Light' },
  { value: 'FAN', label: 'Fan' },
  { value: 'SOCKET', label: 'Socket' },
  { value: 'RGB_LIGHT', label: 'RGB Light' },
  { value: 'CURTAIN', label: 'Curtain' },
  { value: 'DOOR', label: 'Door' },
  { value: 'GARAGE', label: 'Garage' },
  { value: 'TEMPERATURE_SENSOR', label: 'Temperature Sensor' },
  { value: 'HUMIDITY_SENSOR', label: 'Humidity Sensor' },
  { value: 'MOTION_SENSOR', label: 'Motion Sensor' },
  { value: 'POWER_MONITOR', label: 'Power Monitor' },
]

const schema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  bleDeviceId: z.string().optional(),
  bleDeviceName: z.string().optional(),
  roomId: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function DevicesPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { devices, rooms, activeHomeId, setDevices, addDevice } = useHomeStore()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (activeHomeId) {
      homeService.getDevices(activeHomeId).then(setDevices).catch(() => {})
    }
  }, [activeHomeId])

  const filtered = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || d.type === filterType
    return matchSearch && matchType
  })

  const onSubmit = async (data: FormData) => {
    if (!activeHomeId) return toast.error('No home selected')
    setSaving(true)
    try {
      const device = await homeService.createDevice(activeHomeId, data)
      addDevice(device)
      setDialogOpen(false)
      reset()
      toast.success('Device added!')
    } catch {
      toast.error('Failed to add device')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Devices</Typography>
          <Typography color="text.secondary" variant="body2">{devices.length} total • {devices.filter((d) => d.online).length} online</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Add Device</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
            <MenuItem value="">All Types</MenuItem>
            {DEVICE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Alert severity="info">No devices found. {devices.length === 0 ? 'Add your first device!' : 'Try adjusting filters.'}</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((device) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={device.id}>
              <DeviceCard device={device} showRoom />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Device Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Device</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Device Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Device Type</InputLabel>
                  <Select {...field} label="Device Type">
                    {DEVICE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Room (Optional)</InputLabel>
                  <Select {...field} label="Room (Optional)">
                    <MenuItem value="">No Room</MenuItem>
                    {rooms.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <TextField label="BLE Device Name (Optional)" fullWidth {...register('bleDeviceName')} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); reset() }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Add Device'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
