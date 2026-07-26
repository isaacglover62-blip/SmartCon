import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material'
import { ArrowBack, Bluetooth, Star, StarBorder, Delete } from '@mui/icons-material'
import { useHomeStore } from '@/store/homeStore'
import { bleService } from '@/services/ble.service'
import { useBLEStore } from '@/store/bleStore'
import { homeService } from '@/services/home.service'
import toast from 'react-hot-toast'

export function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const { devices, updateDevice, removeDevice } = useHomeStore()
  const { status } = useBLEStore()
  const device = devices.find((d) => d.id === deviceId)
  const isConnected = status === 'connected'
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Which relay channel this device controls (stored in bleDeviceName)
  const lightNum = (() => {
    const n = parseInt(device?.bleDeviceName ?? '', 10)
    return n >= 1 && n <= 4 ? n : 1
  })()

  const handleDelete = async () => {
    if (!device) return
    setDeleting(true)
    try {
      await homeService.deleteDevice(device.homeId, device.id)
      removeDevice(device.id)
      toast.success(`${device.name} deleted`)
      navigate('/devices')
    } catch {
      toast.error('Failed to delete device')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (!device) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/devices')}>Back</Button>
        <Typography sx={{ mt: 2 }}>Device not found.</Typography>
      </Box>
    )
  }

  const handleFavorite = async () => {
    try {
      const updated = await homeService.toggleFavorite(device.homeId, device.id)
      updateDevice(updated)
    } catch { toast.error('Failed') }
  }

  const handleAllOff = async () => {
    if (!isConnected) return toast.error('Not connected')
    await bleService.sendCommand('ALL_OFF')
    toast.success('All off command sent')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/devices')}>Back</Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>{device.name}</Typography>
        <IconButton onClick={handleFavorite} color={device.favorite ? 'warning' : 'default'}>
          {device.favorite ? <Star /> : <StarBorder />}
        </IconButton>
        <IconButton onClick={() => setDeleteOpen(true)} color="error">
          <Delete />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Device Info</Typography>
              {[
                ['Type', device.type],
                ['BLE Name', device.bleDeviceName ?? 'N/A'],
                ['Firmware', device.firmwareVersion ?? 'Unknown'],
                ['Battery', device.batteryLevel != null ? `${device.batteryLevel}%` : 'N/A'],
                ['Last Seen', device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">{k}</Typography>
                  <Typography variant="body2" fontWeight={500}>{v}</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2 }}>
                <Chip label={device.online ? 'Online' : 'Offline'} color={device.online ? 'success' : 'default'} size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Bluetooth color={isConnected ? 'primary' : 'disabled'} />
                <Typography variant="h6" fontWeight={600}>Controls</Typography>
                {!isConnected && <Chip size="small" label="BLE not connected" color="warning" />}
              </Box>

              <Grid container spacing={2}>
                {device.type === 'LIGHT' && (
                  <Grid size={12}>
                    <Button fullWidth variant="contained" color="success"
                      onClick={() => bleService.sendCommand(`LIGHT_${lightNum}_ON` as never)}
                      disabled={!isConnected} sx={{ mb: 1 }}>
                      Light {lightNum} — ON
                    </Button>
                    <Button fullWidth variant="contained" color="error"
                      onClick={() => bleService.sendCommand(`LIGHT_${lightNum}_OFF` as never)}
                      disabled={!isConnected}>
                      Light {lightNum} — OFF
                    </Button>
                  </Grid>
                )}

                {device.type === 'FAN' && [0,1,2,3].map((n) => (
                  <Grid size={3} key={n}>
                    <Button fullWidth variant="outlined" onClick={() => bleService.sendCommand(`FAN_${n}` as never)} disabled={!isConnected}>
                      {n === 0 ? 'Off' : n === 1 ? 'Low' : n === 2 ? 'Med' : 'High'}
                    </Button>
                  </Grid>
                ))}

                {device.type === 'RGB_LIGHT' && (
                  <>
                    <Grid size={4}><Button fullWidth variant="outlined" sx={{ bgcolor: '#ef444420', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => bleService.sendCommand('RGB_255_0_0')} disabled={!isConnected}>Red</Button></Grid>
                    <Grid size={4}><Button fullWidth variant="outlined" sx={{ bgcolor: '#22c55e20', borderColor: '#22c55e', color: '#22c55e' }} onClick={() => bleService.sendCommand('RGB_0_255_0')} disabled={!isConnected}>Green</Button></Grid>
                    <Grid size={4}><Button fullWidth variant="outlined" sx={{ bgcolor: '#3b82f620', borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => bleService.sendCommand('RGB_0_0_255')} disabled={!isConnected}>Blue</Button></Grid>
                  </>
                )}

                {device.type === 'SOCKET' && (
                  <>
                    <Grid size={6}><Button fullWidth variant="contained" onClick={() => bleService.sendCommand('SOCKET_1_ON')} disabled={!isConnected}>Socket 1 ON</Button></Grid>
                    <Grid size={6}><Button fullWidth variant="outlined" color="error" onClick={() => bleService.sendCommand('SOCKET_1_OFF')} disabled={!isConnected}>Socket 1 OFF</Button></Grid>
                    <Grid size={6}><Button fullWidth variant="contained" onClick={() => bleService.sendCommand('SOCKET_2_ON')} disabled={!isConnected}>Socket 2 ON</Button></Grid>
                    <Grid size={6}><Button fullWidth variant="outlined" color="error" onClick={() => bleService.sendCommand('SOCKET_2_OFF')} disabled={!isConnected}>Socket 2 OFF</Button></Grid>
                  </>
                )}

                {device.type === 'CURTAIN' && (
                  <>
                    <Grid size={6}><Button fullWidth variant="contained" onClick={() => bleService.sendCommand('CURTAIN_OPEN')} disabled={!isConnected}>Open</Button></Grid>
                    <Grid size={6}><Button fullWidth variant="outlined" onClick={() => bleService.sendCommand('CURTAIN_CLOSE')} disabled={!isConnected}>Close</Button></Grid>
                  </>
                )}

                <Grid size={12}>
                  <Button fullWidth variant="outlined" color="warning" onClick={() => bleService.sendCommand('STATUS')} disabled={!isConnected}>Request Status</Button>
                </Grid>
                <Grid size={12}>
                  <Button fullWidth variant="contained" color="error" onClick={handleAllOff} disabled={!isConnected}>ALL OFF</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {device.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will permanently remove this device. This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
