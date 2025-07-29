import React from 'react'
import { Box, Typography, Chip } from '@mui/material'

const Templates = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Templates de Fluxos
        </Typography>
        <Chip label="Novo" color="secondary" size="small" />
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        Galeria de templates pré-configurados em desenvolvimento...
      </Typography>
    </Box>
  )
}

export default Templates
