import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  Divider, Button, Select, MenuItem, FormControl, InputLabel, List,
  ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material'
import { DarkMode, LightMode, Bluetooth, Notifications, Info, Download, Upload } from '@mui/icons-material'
import { useThemeStore } from '@/store/themeStore'
import { useBLEStore } from '@/store/bleStore'
import { bleService } from '@/services/ble.service'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { mode, toggle } = useThemeStore()
  const { status } = useBLEStore()
  const isConnected = status === 'connected'

  const handleExportData = () => {
    const data = {
      homes: JSON.parse(localStorage.getItem('smarthome-home') ?? '{}'),
      bleDevices: JSON.parse(localStorage.getItem('ble-saved-devices') ?? '[]'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'smarthome-backup.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported!')
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Settings</Typography>

      {/* Appearance */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Appearance</Typography>
          <List disablePadding>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText primary="Dark Mode" secondary="Toggle between dark and light themes" />
              <ListItemSecondaryAction>
                <Switch checked={mode === 'dark'} onChange={toggle} />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Bluetooth */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bluetooth fontSize="small" /> Bluetooth
          </Typography>
          <List disablePadding>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary="BLE Status"
                secondary={isConnected ? 'Connected to ESP32 device' : 'No device connected'}
              />
              <ListItemSecondaryAction>
                <Button size="small" variant={isConnected ? 'outlined' : 'contained'} color={isConnected ? 'error' : 'primary'}
                  onClick={isConnected ? () => bleService.disconnect() : () => bleService.scan().catch(() => {})}>
                  {isConnected ? 'Disconnect' : 'Scan'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText primary="Auto-Reconnect" secondary="Automatically reconnect to paired devices (5 attempts, exponential backoff)" />
              <ListItemSecondaryAction>
                <Switch checked defaultChecked disabled />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Data */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Data</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportData}>Export Data</Button>
          </Box>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info fontSize="small" /> About
          </Typography>
          {[
            ['App', 'SmartHome BLE'],
            ['Version', '1.0.0'],
            ['Service UUID', '4FAFC201-1FB5-459E-8FCC-C5C9C331914B'],
            ['Platform', 'Web PWA (installable)'],
            ['Protocol', 'Web Bluetooth API + REST'],
          ].map(([k, v]) => (
            <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">{k}</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>{v}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}
