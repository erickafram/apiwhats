import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

const LoadingScreen = ({ message = 'Carregando...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}

export default LoadingScreen
