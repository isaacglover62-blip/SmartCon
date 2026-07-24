import { Box, Typography } from '@mui/material'
import { Bluetooth, BluetoothSearching, BluetoothDisabled, BluetoothConnected } from '@mui/icons-material'
import type { BLEStatus } from '@/store/bleStore'

const STATUS_CONFIG = {
  idle: { icon: BluetoothDisabled, color: '#64748b', label: 'Idle' },
  scanning: { icon: BluetoothSearching, color: '#f59e0b', label: 'Scanning...' },
  connecting: { icon: BluetoothSearching, color: '#6366f1', label: 'Connecting...' },
  connected: { icon: BluetoothConnected, color: '#10b981', label: 'Connected' },
  disconnected: { icon: BluetoothDisabled, color: '#ef4444', label: 'Disconnected' },
  error: { icon: BluetoothDisabled, color: '#ef4444', label: 'Error' },
}

interface Props {
  status: BLEStatus
  showLabel?: boolean
  size?: 'small' | 'medium'
}

export function BLEStatusBadge({ status, showLabel = false, size = 'medium' }: Props) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const iconSize = size === 'small' ? 18 : 24

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Icon sx={{ fontSize: iconSize, color: config.color }} />
        {status === 'connected' && (
          <Box sx={{
            position: 'absolute', top: -2, right: -2,
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: '#10b981', border: '2px solid',
            borderColor: 'background.paper',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }} />
        )}
      </Box>
      {showLabel && (
        <Typography variant="caption" sx={{ color: config.color, fontWeight: 600 }}>
          {config.label}
        </Typography>
      )}
    </Box>
  )
}
