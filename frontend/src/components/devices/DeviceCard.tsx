import { useState } from 'react'
import { Card, CardContent, Box, Typography, Switch, Slider, IconButton, Chip, Tooltip } from '@mui/material'
import { Star, StarBorder, Lightbulb, Toys, Power, ColorLens, Curtains, Thermostat, WaterDrop, Sensors, ElectricBolt } from '@mui/icons-material'
import type { Device, BLECommand } from '@/types'
import { bleService } from '@/services/ble.service'
import { useBLEStore } from '@/store/bleStore'
import { homeService } from '@/services/home.service'
import { useHomeStore } from '@/store/homeStore'
import toast from 'react-hot-toast'

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  LIGHT: <Lightbulb />,
  FAN: <Toys />,
  SOCKET: <Power />,
  RGB_LIGHT: <ColorLens />,
  CURTAIN: <Curtains />,
  TEMPERATURE_SENSOR: <Thermostat />,
  HUMIDITY_SENSOR: <WaterDrop />,
  MOTION_SENSOR: <Sensors />,
  POWER_MONITOR: <ElectricBolt />,
  default: <Power />,
}

interface Props {
  device: Device
  showRoom?: boolean
}

export function DeviceCard({ device, showRoom = false }: Props) {
  const [power, setPower] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [fanSpeed, setFanSpeed] = useState(0)
  const { status: bleStatus } = useBLEStore()
  const { updateDevice } = useHomeStore()

  const isConnected = bleStatus === 'connected'
  const icon = DEVICE_ICONS[device.type] ?? DEVICE_ICONS.default

  const sendCommand = async (cmd: BLECommand) => {
    if (!isConnected) {
      toast.error('No BLE device connected')
      return
    }
    try {
      await bleService.sendCommand(cmd)
    } catch {
      toast.error('Command failed')
    }
  }

  const handlePowerToggle = async () => {
    const next = !power
    setPower(next)
    const cmdMap: Record<string, BLECommand> = {
      LIGHT: next ? 'LIGHT_1_ON' : 'LIGHT_1_OFF',
      SOCKET: next ? 'SOCKET_1_ON' : 'SOCKET_1_OFF',
    }
    const cmd = cmdMap[device.type]
    if (cmd) await sendCommand(cmd)
  }

  const handleFanSpeed = async (speed: number) => {
    setFanSpeed(speed)
    await sendCommand(`FAN_${speed}` as BLECommand)
  }

  const handleFavorite = async () => {
    try {
      const updated = await homeService.toggleFavorite(device.homeId, device.id)
      updateDevice(updated)
    } catch {
      toast.error('Failed to update favorite')
    }
  }

  return (
    <Card sx={{
      height: '100%',
      border: power ? '1px solid' : undefined,
      borderColor: power ? 'primary.main' : undefined,
      transition: 'all 0.2s',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: power ? 'primary.main' : 'action.hover',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: power ? '#fff' : 'text.secondary',
              transition: 'all 0.2s',
            }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>{device.name}</Typography>
              <Chip
                size="small"
                label={device.online ? 'Online' : 'Offline'}
                color={device.online ? 'success' : 'default'}
                sx={{ height: 16, fontSize: 10 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Tooltip title={device.favorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton size="small" onClick={handleFavorite} sx={{ color: device.favorite ? 'warning.main' : 'text.disabled' }}>
                {device.favorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {(device.type === 'LIGHT' || device.type === 'SOCKET') && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">{power ? 'ON' : 'OFF'}</Typography>
            <Switch
              size="small"
              checked={power}
              onChange={handlePowerToggle}
              disabled={!isConnected}
              color="primary"
            />
          </Box>
        )}

        {device.type === 'LIGHT' && power && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">Brightness: {brightness}%</Typography>
            <Slider
              size="small"
              value={brightness}
              onChange={(_, v) => setBrightness(v as number)}
              min={0}
              max={100}
              sx={{ mt: 0.5 }}
              disabled={!isConnected}
            />
          </Box>
        )}

        {device.type === 'FAN' && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
            {['Off', 'Low', 'Med', 'High'].map((label, i) => (
              <Chip
                key={i}
                label={label}
                size="small"
                variant={fanSpeed === i ? 'filled' : 'outlined'}
                color={fanSpeed === i ? 'primary' : 'default'}
                onClick={() => handleFanSpeed(i)}
                sx={{ flex: 1, cursor: 'pointer', fontSize: 10 }}
              />
            ))}
          </Box>
        )}

        {device.type === 'RGB_LIGHT' && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            {[
              { color: '#ef4444', cmd: 'RGB_255_0_0' },
              { color: '#22c55e', cmd: 'RGB_0_255_0' },
              { color: '#3b82f6', cmd: 'RGB_0_0_255' },
            ].map(({ color, cmd }) => (
              <Box
                key={color}
                onClick={() => sendCommand(cmd as BLECommand)}
                sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: color, cursor: 'pointer', '&:hover': { transform: 'scale(1.2)' }, transition: 'transform 0.15s' }}
              />
            ))}
          </Box>
        )}

        {device.type === 'CURTAIN' && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label="Open" size="small" onClick={() => sendCommand('CURTAIN_OPEN')} sx={{ flex: 1, cursor: 'pointer' }} />
            <Chip label="Close" size="small" onClick={() => sendCommand('CURTAIN_CLOSE')} sx={{ flex: 1, cursor: 'pointer' }} />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
