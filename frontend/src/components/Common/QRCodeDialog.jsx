import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material'
import { WhatsApp as WhatsAppIcon } from '@mui/icons-material'

const QRCodeDialog = ({ open, onClose, qrCode, botName }) => {
  const steps = [
    {
      label: 'Abra o WhatsApp no seu celular',
      description: 'Certifique-se de que você tem o WhatsApp instalado e funcionando no seu dispositivo móvel.'
    },
    {
      label: 'Acesse as configurações',
      description: 'Vá em Configurações > Aparelhos conectados (ou "WhatsApp Web" em versões mais antigas).'
    },
    {
      label: 'Conectar um aparelho',
      description: 'Toque em "Conectar um aparelho" ou no ícone de QR Code.'
    },
    {
      label: 'Escaneie o código',
      description: 'Aponte a câmera do seu celular para o QR Code abaixo.'
    }
  ]

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <WhatsAppIcon sx={{ fontSize: 40, color: '#25D366', mb: 1 }} />
        <Typography variant="h5">
          Conectar {botName} ao WhatsApp
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Mantenha esta janela aberta durante o processo de conexão. 
            O QR Code expira em alguns minutos e será renovado automaticamente.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Instruções */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Como conectar:
            </Typography>
            
            <Stepper orientation="vertical">
              {steps.map((step, index) => (
                <Step key={index} active={true}>
                  <StepLabel>
                    <Typography variant="subtitle2">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* QR Code */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {qrCode ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  QR Code:
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: 'white',
                    display: 'inline-block'
                  }}
                >
                  <img 
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR Code WhatsApp"
                    style={{ 
                      width: '200px', 
                      height: '200px',
                      display: 'block'
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Escaneie este código com seu WhatsApp
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Gerando QR Code...
                </Typography>
                <Box sx={{ 
                  width: 200, 
                  height: 200, 
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 2
                }}>
                  <WhatsAppIcon sx={{ fontSize: 60, color: '#ccc' }} />
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Dica:</strong> Após escanear o QR Code, aguarde alguns segundos para que a conexão seja estabelecida. 
            Você verá uma confirmação quando o bot estiver conectado com sucesso.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{ 
            backgroundColor: '#25D366',
            '&:hover': { backgroundColor: '#1da851' }
          }}
        >
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QRCodeDialog
