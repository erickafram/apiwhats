import React from 'react'
import { Box, Typography, Chip } from '@mui/material'

const Queue = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fila de Atendimento
        </Typography>
        <Chip label="Novo" color="secondary" size="small" />
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        Sistema de filas para atendimento humano em desenvolvimento...
      </Typography>
    </Box>
  )
}

export default Queue
