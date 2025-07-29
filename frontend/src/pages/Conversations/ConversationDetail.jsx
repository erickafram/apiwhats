import React from 'react'
import { Box, Typography } from '@mui/material'

const ConversationDetail = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Detalhes da Conversa
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Detalhes da conversa em desenvolvimento...
      </Typography>
    </Box>
  )
}

export default ConversationDetail
