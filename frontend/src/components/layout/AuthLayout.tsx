import { Outlet } from 'react-router-dom'
import { Box, Container } from '@mui/material'

const BG_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background photo — visible on all screens */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10,10,30,0.82) 0%, rgba(30,10,60,0.70) 100%)',
          },
        }}
      />

      {/* Centered form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          px: 2,
          py: 4,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            width: '100%',
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
