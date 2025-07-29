import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const Bots = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Meus Bots
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Criar novo bot')}
        >
          Novo Bot
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        Página de gerenciamento de bots em desenvolvimento...
      </Typography>
    </Box>
  )
}

export default Bots
