import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, List, ListItem,
  ListItemAvatar, ListItemText, ListItemSecondaryAction, Avatar,
  IconButton, Chip, Alert, Divider, CircularProgress,
} from '@mui/material'
import {
  Bluetooth, BluetoothSearching, BluetoothConnected, BluetoothDisabled,
  Delete, Link, LinkOff, SignalCellularAlt, InfoOutlined,
} from '@mui/icons-material'
import { bleService } from '@/services/ble.service'
import { useBLEStore } from '@/store/bleStore'
import { BLEStatusBadge } from '@/components/ble/BLEStatusBadge'
import toast from 'react-hot-toast'

export function BLEScannerPage() {
  const [scanning, setScanning] = useState(false)
  const { status, connectedDevice, scannedDevices, savedDevices, removeSavedDevice, errorMessage } = useBLEStore()

  const isSupported = bleService.isSupported()

  const handleScan = async () => {
    if (!isSupported) {
      toast.error('Web Bluetooth not supported. Use Chrome, Edge, Opera, or Brave on desktop/Android.')
      return
    }
    setScanning(true)
    try {
      await bleService.scan()
    } catch {
      // error handled in store
    } finally {
      setScanning(false)
    }
  }

  const handleDisconnect = () => {
    bleService.disconnect()
    toast.success('Disconnected')
  }

  const handleReconnect = async (deviceId: string, name: string) => {
    try {
      await bleService.connectById(deviceId, name)
    } catch {
      toast.error('Could not reconnect. Try scanning again.')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>BLE Scanner</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Scan and manage Bluetooth Low Energy connections to your ESP32 devices.
      </Typography>

      {!isSupported && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Web Bluetooth requires a Chromium-based browser. Use <strong>Chrome, Edge, Opera, or Brave</strong> on desktop or Android. Firefox and Safari are not supported.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BLEStatusBadge status={status} />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>
                {status === 'connected' ? connectedDevice?.name : status === 'scanning' ? 'Scanning for devices...' : status === 'connecting' ? 'Connecting...' : 'Ready to scan'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Service UUID: 4FAFC201-1FB5-459E-8FCC-C5C9C331914B
              </Typography>
            </Box>
            <BLEStatusBadge status={status} showLabel size="small" />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={scanning || status === 'scanning' ? <CircularProgress size={16} color="inherit" /> : <BluetoothSearching />}
              onClick={handleScan}
              disabled={!isSupported || scanning || status === 'scanning' || status === 'connecting'}
            >
              {scanning ? 'Scanning...' : 'Scan & Connect'}
            </Button>

            {status === 'connected' && (
              <Button variant="outlined" color="error" startIcon={<LinkOff />} onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Connection Info */}
      {status === 'connected' && connectedDevice && (
        <Card sx={{ mb: 3, borderColor: 'success.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}><BluetoothConnected /></Avatar>
              <Box>
                <Typography fontWeight={700}>{connectedDevice.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>ID: {connectedDevice.deviceId}</Typography>
                <Chip size="small" label="Active Connection" color="success" sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }} icon={<InfoOutlined />}>
              ESP32 is sending live status updates. Commands are being sent over characteristic BEB5483E-...
            </Alert>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Saved Devices */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Saved Devices ({savedDevices.length})
      </Typography>

      {savedDevices.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <BluetoothDisabled sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">No saved devices. Connect to a device to save it.</Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
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
                    primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{device.name}{isActive && <Chip size="small" label="Connected" color="success" />}</Box>}
                    secondary={device.deviceId}
                  />
                  <ListItemSecondaryAction>
                    {!isActive && (
                      <IconButton size="small" onClick={() => handleReconnect(device.deviceId, device.name)} sx={{ mr: 1 }}>
                        <Link />
                      </IconButton>
                    )}
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

      {/* BLE Info */}
      <Card sx={{ mt: 3, bgcolor: 'action.hover' }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>Technical Details</Typography>
          <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            {[
              ['Service UUID', '4FAFC201-1FB5-459E-8FCC-C5C9C331914B'],
              ['Characteristic UUID', 'BEB5483E-36E1-4688-B7F5-EA07361B26A8'],
              ['Protocol', 'BLE GATT (Read/Write/Notify)'],
              ['Auto-Reconnect', 'Enabled (5 attempts, exponential backoff)'],
            ].map(([k, v]) => (
              <Box key={k} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">{k}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: 11 }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
