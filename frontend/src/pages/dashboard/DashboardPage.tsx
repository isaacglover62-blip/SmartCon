import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Avatar, LinearProgress, IconButton, Tooltip, Skeleton,
} from '@mui/material'
import {
  Bluetooth, BluetoothDisabled, Thermostat, WaterDrop,
  ElectricBolt, Devices, MeetingRoom, AutoFixHigh,
  Refresh, Add, Star,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHomeStore } from '@/store/homeStore'
import { useBLEStore } from '@/store/bleStore'
import { homeService } from '@/services/home.service'
import { bleService } from '@/services/ble.service'
import { DeviceCard } from '@/components/devices/DeviceCard'
import { BLEStatusBadge } from '@/components/ble/BLEStatusBadge'
import toast from 'react-hot-toast'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { homes, activeHomeId, rooms, devices, setHomes, setRooms, setDevices, setActiveHome, getActiveHome } = useHomeStore()
  const { status: bleStatus, connectedDevice, lastResponse } = useBLEStore()
  const [loading, setLoading] = useState(true)

  const activeHome = getActiveHome()
  const favoriteDevices = devices.filter((d) => d.favorite)
  const onlineDevices = devices.filter((d) => d.online)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const fetchedHomes = await homeService.getHomes()
      setHomes(fetchedHomes)
      if (fetchedHomes.length > 0) {
        const homeId = activeHomeId ?? fetchedHomes[0].id
        setActiveHome(homeId)
        const [fetchedRooms, fetchedDevices] = await Promise.all([
          homeService.getRooms(homeId),
          homeService.getDevices(homeId),
        ])
        setRooms(fetchedRooms)
        setDevices(fetchedDevices)
      }
    } catch {
      // Use cached data from store
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    try {
      await bleService.scan()
    } catch {
      toast.error('BLE scan failed')
    }
  }

  const temp = (lastResponse?.temperature as number | undefined) ?? '--'
  const humidity = (lastResponse?.humidity as number | undefined) ?? '--'

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Good {getGreeting()}, {user?.firstName}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {activeHome?.name ?? 'No home selected'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <IconButton onClick={loadData} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <Bluetooth />, label: 'BLE Status', value: bleStatus === 'connected' ? connectedDevice?.name ?? 'Connected' : 'Disconnected', color: bleStatus === 'connected' ? 'success.main' : 'warning.main' },
          { icon: <Thermostat />, label: 'Temperature', value: `${temp}°C`, color: 'info.main' },
          { icon: <WaterDrop />, label: 'Humidity', value: `${humidity}%`, color: 'primary.main' },
          { icon: <ElectricBolt />, label: 'Devices Online', value: `${onlineDevices.length}/${devices.length}`, color: 'secondary.main' },
        ].map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: stat.color, display: 'flex', alignItems: 'center' }}>{stat.icon}</Box>
                </Box>
                <Typography variant="h6" fontWeight={700}>{loading ? <Skeleton width={60} /> : stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* BLE Connection */}
      <Card sx={{ mb: 3, background: bleStatus === 'connected' ? 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.1))' : undefined }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BLEStatusBadge status={bleStatus} />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600}>
              {bleStatus === 'connected' ? `Connected: ${connectedDevice?.name}` : 'No device connected'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {bleStatus === 'connected' ? 'Receiving live data from ESP32' : 'Scan to find and connect ESP32 devices'}
            </Typography>
          </Box>
          <Button variant={bleStatus === 'connected' ? 'outlined' : 'contained'} size="small" startIcon={bleStatus === 'connected' ? <BluetoothDisabled /> : <Bluetooth />} onClick={bleStatus === 'connected' ? () => bleService.disconnect() : handleScan}>
            {bleStatus === 'connected' ? 'Disconnect' : 'Scan & Connect'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Add Room', icon: <MeetingRoom />, path: '/rooms', color: '#6366f1' },
          { label: 'Add Device', icon: <Devices />, path: '/devices', color: '#ec4899' },
          { label: 'New Scene', icon: <AutoFixHigh />, path: '/scenes', color: '#10b981' },
          { label: 'BLE Scanner', icon: <Bluetooth />, path: '/scanner', color: '#f59e0b' },
        ].map((action) => (
          <Grid size={{ xs: 6, md: 3 }} key={action.label}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: action.color + '20', color: action.color, mx: 'auto', mb: 1 }}>
                  {action.icon}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>{action.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Favorite Devices */}
      {favoriteDevices.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color="warning" fontSize="small" /> Favorites
            </Typography>
            <Button size="small" onClick={() => navigate('/devices')}>View all</Button>
          </Box>
          <Grid container spacing={2}>
            {favoriteDevices.slice(0, 4).map((device) => (
              <Grid size={{ xs: 12, sm: 6 }} md={3} key={device.id}>
                <DeviceCard device={device} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Rooms */}
      {rooms.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Rooms</Typography>
            <Button size="small" onClick={() => navigate('/rooms')}>View all</Button>
          </Box>
          <Grid container spacing={2}>
            {rooms.slice(0, 4).map((room) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={room.id}>
                <Card sx={{ cursor: 'pointer', borderLeft: `3px solid ${room.color}` }} onClick={() => navigate('/rooms')}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography fontWeight={600} noWrap>{room.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {devices.filter((d) => d.roomId === room.id).length} devices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {homes.length === 0 && !loading && (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <Typography variant="h6" gutterBottom>Welcome to SmartHome BLE!</Typography>
          <Typography color="text.secondary" gutterBottom>Create your first home to get started.</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/homes')} sx={{ mt: 2 }}>
            Create Home
          </Button>
        </Card>
      )}
    </Box>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
