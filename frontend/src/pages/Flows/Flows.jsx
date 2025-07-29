import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const Flows = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fluxos Conversacionais
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Criar novo fluxo')}
        >
          Novo Fluxo
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        Página de gerenciamento de fluxos em desenvolvimento...
      </Typography>
    </Box>
  )
}

export default Flows
