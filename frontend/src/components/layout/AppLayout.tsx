import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Tooltip,
  useTheme, useMediaQuery, Divider, Chip, BottomNavigation,
  BottomNavigationAction, Paper,
} from '@mui/material'
import {
  Dashboard, Home, MeetingRoom, Devices, Bluetooth, AutoFixHigh,
  MovieFilter, Notifications, Settings, Person, Menu as MenuIcon,
  DarkMode, LightMode, WifiOff, Close,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useBLEStore } from '@/store/bleStore'

const DRAWER_WIDTH = 260

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/' },
  { label: 'Homes', icon: <Home />, path: '/homes' },
  { label: 'Rooms', icon: <MeetingRoom />, path: '/rooms' },
  { label: 'Devices', icon: <Devices />, path: '/devices' },
  { label: 'BLE Scanner', icon: <Bluetooth />, path: '/scanner' },
  { label: 'Automation', icon: <AutoFixHigh />, path: '/automation' },
  { label: 'Scenes', icon: <MovieFilter />, path: '/scenes' },
]

const BOTTOM_ITEMS = [
  { label: 'Notifications', icon: <Notifications />, path: '/notifications' },
  { label: 'Profile', icon: <Person />, path: '/profile' },
  { label: 'Settings', icon: <Settings />, path: '/settings' },
]

const MOBILE_NAV = [
  { label: 'Home', icon: <Dashboard />, path: '/' },
  { label: 'Devices', icon: <Devices />, path: '/devices' },
  { label: 'BLE', icon: <Bluetooth />, path: '/scanner' },
  { label: 'Scenes', icon: <MovieFilter />, path: '/scenes' },
  { label: 'Profile', icon: <Person />, path: '/profile' },
]

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuthStore()
  const { mode, toggle } = useThemeStore()
  const { status, connectedDevice } = useBLEStore()

  const isConnected = status === 'connected'

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, flexShrink: 0 }}>
          <img src="/smartcon-logo.png" alt="SmartCon" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ background: 'linear-gradient(90deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SmartHome
        </Typography>
        {isMobile && (
          <IconButton sx={{ ml: 'auto' }} onClick={() => setMobileOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      {isConnected && (
        <Box sx={{ mx: 2, mb: 1 }}>
          <Chip
            size="small"
            icon={<Bluetooth sx={{ fontSize: 14 }} />}
            label={connectedDevice?.name ?? 'BLE Connected'}
            color="success"
            sx={{ width: '100%', justifyContent: 'flex-start' }}
          />
        </Box>
      )}

      <List sx={{ flex: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false) }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: active ? 'primary.main' : 'transparent',
                  '&:hover': { backgroundColor: active ? 'primary.dark' : 'action.hover' },
                  color: active ? '#fff' : 'text.primary',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? '#fff' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: active ? 600 : 400, fontSize: 14 } }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />
      <List sx={{ px: 1 }}>
        {BOTTOM_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false) }}
                sx={{ borderRadius: 2, backgroundColor: active ? 'primary.main' : 'transparent', color: active ? '#fff' : 'text.primary' }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? '#fff' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 14 } }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, flexShrink: 0 }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>{user?.firstName} {user?.lastName}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
        </Box>
      </Box>
    </Box>
  )

  const currentMobileNavIndex = MOBILE_NAV.findIndex((i) => i.path === location.pathname)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {[...NAV_ITEMS, ...BOTTOM_ITEMS].find((i) => i.path === location.pathname)?.label ?? 'SmartHome'}
          </Typography>

          {!isConnected && (
            <Tooltip title="No BLE device connected">
              <WifiOff color="warning" sx={{ mr: 1 }} />
            </Tooltip>
          )}

          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton onClick={toggle}>{mode === 'dark' ? <LightMode /> : <DarkMode />}</IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar — hidden on mobile */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: '64px',
          pb: { xs: '56px', md: 0 },
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom navigation — mobile only */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          elevation={3}
        >
          <BottomNavigation
            value={currentMobileNavIndex >= 0 ? currentMobileNavIndex : false}
            onChange={(_, newValue) => navigate(MOBILE_NAV[newValue].path)}
            sx={{ bgcolor: 'background.paper' }}
          >
            {MOBILE_NAV.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                sx={{
                  '&.Mui-selected': { color: 'primary.main' },
                  minWidth: 0,
                  fontSize: 10,
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}
