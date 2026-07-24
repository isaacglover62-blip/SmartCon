import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'

interface Props {
  onDone: () => void
}

export function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'), 2200)
    const t3 = setTimeout(() => onDone(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d1f3c 100%)',
        transition: 'opacity 0.6s ease',
        opacity: phase === 'out' ? 0 : 1,
      }}
    >
      {/* Ambient glow rings */}
      <Box sx={{
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        animation: 'pulse-ring 2.5s ease-in-out infinite',
        '@keyframes pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
          '50%': { transform: 'scale(1.15)', opacity: 1 },
        },
      }} />
      <Box sx={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: '1px solid rgba(37,99,235,0.25)',
        animation: 'ring-expand 2.5s ease-in-out infinite 0.4s',
        '@keyframes ring-expand': {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '50%': { transform: 'scale(1.2)', opacity: 0.6 },
          '100%': { transform: 'scale(1.5)', opacity: 0 },
        },
      }} />
      <Box sx={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: '1px solid rgba(96,165,250,0.15)',
        animation: 'ring-expand 2.5s ease-in-out infinite 1.2s',
      }} />

      {/* Logo */}
      <Box
        sx={{
          position: 'relative',
          width: 96,
          height: 96,
          mb: 3,
          animation: 'logo-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',
          opacity: 0,
          '@keyframes logo-in': {
            '0%': { opacity: 0, transform: 'scale(0.5) translateY(20px)' },
            '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
          },
        }}
      >
        {/* Glow behind logo */}
        <Box sx={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }} />
        <img
          src="/smartcon-logo.png"
          alt="SmartCon"
          style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
        />
      </Box>

      {/* App name */}
      <Box
        sx={{
          animation: 'text-in 0.6s ease forwards 0.3s',
          opacity: 0,
          textAlign: 'center',
          '@keyframes text-in': {
            '0%': { opacity: 0, transform: 'translateY(12px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Typography
          component="div"
          sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}
        >
          <Box component="span" sx={{ color: '#e2e8f0' }}>smart</Box>
          <Box component="span" sx={{ color: '#2563eb' }}>Con</Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 3,
            color: 'rgba(166,173,200,0.7)',
            textTransform: 'uppercase',
            mt: 0.8,
          }}
        >
          Smart Home Control
        </Typography>
      </Box>

      {/* Loading dots */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.8,
          mt: 5,
          animation: 'dots-in 0.4s ease forwards 0.8s',
          opacity: 0,
          '@keyframes dots-in': {
            to: { opacity: 1 },
          },
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
              animation: 'dot-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes dot-bounce': {
                '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                '40%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
