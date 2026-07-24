import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Typography, IconButton, Slide } from '@mui/material'
import { Close, GetApp } from '@mui/icons-material'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Small delay so it doesn't appear immediately on load
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 24 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: { xs: 'calc(100% - 32px)', sm: 400 },
          maxWidth: 400,
        }}
      >
        <Card elevation={8} sx={{ border: '1px solid', borderColor: 'primary.main' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, flexShrink: 0 }}>
                <img src="/smartcon-logo.png" alt="SmartCon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700}>Install SmartCon</Typography>
                <Typography variant="caption" color="text.secondary">
                  Add to your home screen for quick access
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Button size="small" variant="contained" startIcon={<GetApp />} onClick={handleInstall}>
                  Install
                </Button>
                <IconButton size="small" onClick={handleDismiss}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Slide>
  )
}
