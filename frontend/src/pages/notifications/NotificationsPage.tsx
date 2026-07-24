import { useState } from 'react'
import {
  Box, Typography, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Chip, IconButton, Button, Card, CardContent,
} from '@mui/material'
import {
  Notifications, Check, Delete, Info, Warning, Error, DeviceHub, AutoFixHigh, Security,
} from '@mui/icons-material'
import type { Notification } from '@/types'

const TYPE_CONFIG = {
  INFO: { icon: <Info />, color: 'info.main' },
  WARNING: { icon: <Warning />, color: 'warning.main' },
  ERROR: { icon: <Error />, color: 'error.main' },
  DEVICE: { icon: <DeviceHub />, color: 'primary.main' },
  AUTOMATION: { icon: <AutoFixHigh />, color: 'secondary.main' },
  SECURITY: { icon: <Security />, color: 'error.main' },
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Device Connected', body: 'ESP32-Home connected via BLE', type: 'DEVICE', read: false, createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: '2', title: 'Automation Triggered', body: 'Morning Routine activated at 7:00 AM', type: 'AUTOMATION', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: 'Device Offline', body: 'Living Room Light went offline', type: 'WARNING', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Welcome!', body: 'Your SmartHome system is set up and ready.', type: 'INFO', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const unread = notifications.filter((n) => !n.read).length

  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id))
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Notifications</Typography>
          {unread > 0 && <Chip size="small" label={`${unread} unread`} color="primary" sx={{ mt: 0.5 }} />}
        </Box>
        {unread > 0 && <Button size="small" onClick={markAllRead} startIcon={<Check />}>Mark all read</Button>}
      </Box>

      {notifications.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Notifications sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">No notifications</Typography>
        </CardContent></Card>
      ) : (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type]
            return (
              <Card key={notif.id} sx={{ opacity: notif.read ? 0.7 : 1, borderLeft: notif.read ? undefined : '3px solid', borderColor: 'primary.main' }}>
                <ListItem secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!notif.read && <IconButton size="small" onClick={() => markRead(notif.id)}><Check fontSize="small" /></IconButton>}
                    <IconButton size="small" color="error" onClick={() => deleteNotif(notif.id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                }>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: config.color + '20', color: config.color }}>{config.icon}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={notif.read ? 400 : 600}>{notif.title}</Typography>
                      {!notif.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                    </Box>}
                    secondary={<>{notif.body}<br /><Typography variant="caption" color="text.disabled">{new Date(notif.createdAt).toLocaleString()}</Typography></>}
                  />
                </ListItem>
              </Card>
            )
          })}
        </List>
      )}
    </Box>
  )
}
