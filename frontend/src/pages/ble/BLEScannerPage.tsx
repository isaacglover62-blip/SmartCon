import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Alert, Chip, Avatar, CircularProgress, Divider, List,
  ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton,
} from '@mui/material'
import {
  Bluetooth, BluetoothConnected, BluetoothDisabled,
  Delete, LinkOff, Wifi, WifiOff, CheckCircle,
} from '@mui/icons-material'
import { bleService } from '@/services/ble.service'
import { useBLEStore } from '@/store/bleStore'
import toast from 'react-hot-toast'

export function BLEScannerPage() {
  const { status, connectedDevice, savedDevices, removeSavedDevice, errorMessage, relayUrl, setRelayUrl } = useBLEStore()
  const [inputUrl, setInputUrl] = useState(relayUrl || 'ws://192.168.1.')
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    const url = inputUrl.trim()
    if (!url.startsWith('ws://')) {
      toast.error('URL must start with ws://')
      return
    }
    setRelayUrl(url)
    setConnecting(true)
    try {
      await bleService.connectToRelay(url)
      toast.success('Connected to HC-06 via relay!')
    } catch {
      // error shown in store
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    bleService.disconnect()
    toast.success('Disconnected')
  }

  const isConnected = status === 'connected'

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Device Connection</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Connect to your Arduino HC-06 via the laptop relay.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>
      )}

      {/* Relay URL input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Wifi color="primary" />
            <Typography fontWeight={600}>Relay Server</Typography>
            {isConnected && <Chip size="small" label="Connected" color="success" icon={<CheckCircle />} />}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your laptop's IP address. Make sure your phone and laptop are on the same WiFi network and the relay script is running.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Relay URL"
              placeholder="ws://192.168.1.100:8765"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={isConnected || connecting}
              size="small"
              helperText='Format: ws://YOUR-LAPTOP-IP:8765'
            />
            {isConnected ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LinkOff />}
                onClick={handleDisconnect}
                sx={{ minWidth: 140 }}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={connecting ? <CircularProgress size={16} color="inherit" /> : <Bluetooth />}
                onClick={handleConnect}
                disabled={connecting}
                sx={{ minWidth: 140 }}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Connected device info */}
      {isConnected && connectedDevice && (
        <Card sx={{ mb: 3, borderColor: 'success.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}><BluetoothConnected /></Avatar>
              <Box>
                <Typography fontWeight={700}>{connectedDevice.name}</Typography>
                <Typography variant="caption" color="text.secondary">{relayUrl}</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip size="small" label="Live" color="success" />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Saved devices */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Saved Connections ({savedDevices.length})
      </Typography>

      {savedDevices.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BluetoothDisabled sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">No saved connections yet.</Typography>
          </CardContent>
        </Card>
      ) : (
        <List disablePadding>
          {savedDevices.map((device) => {
            const isActive = connectedDevice?.deviceId === device.deviceId
            return (
              <Card key={device.deviceId} sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isActive ? 'success.main' : 'primary.main' }}>
                      <Bluetooth />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {device.name}
                        {isActive && <Chip size="small" label="Connected" color="success" />}
                      </Box>
                    }
                    secondary={relayUrl}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => removeSavedDevice(device.deviceId)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Card>
            )
          })}
        </List>
      )}

      {/* Setup instructions */}
      <Card sx={{ mt: 3, bgcolor: 'action.hover' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <WifiOff fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight={600}>Relay Setup (one-time)</Typography>
          </Box>
          {[
            '1. Pair HC-06 to your laptop via Bluetooth Settings (PIN: 1234)',
            '2. Install Python deps: pip install pyserial websockets',
            '3. Run: python relay.py  (find your laptop IP with ipconfig / ifconfig)',
            '4. Enter ws://LAPTOP-IP:8765 above and tap Connect',
          ].map((step) => (
            <Typography key={step} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {step}
            </Typography>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}
