import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  Link as MuiLink
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  AutoAwesome,
  Chat,
  Timeline,
  SmartToy,
  Speed,
  Security
} from '@mui/icons-material';

const LandingPage = () => {
  // Dados dos recursos
  const features = [
    {
      icon: <AutoAwesome />,
      title: "Integração com IA",
      description: "Respostas inteligentes baseadas em contexto com processamento de linguagem natural."
    },
    {
      icon: <Timeline />,
      title: "Automação de Fluxos",
      description: "Crie fluxos de conversação visuais e personalizados para qualquer cenário."
    },
    {
      icon: <Chat />,
      title: "Gestão de Conversas",
      description: "Interface centralizada para gerenciar todas as suas conversas do WhatsApp."
    },
    {
      icon: <Speed />,
      title: "Respostas Rápidas",
      description: "Reduza o tempo de resposta com templates pré-configurados."
    },
    {
      icon: <SmartToy />,
      title: "Bots Inteligentes",
      description: "Crie bots que aprendem com as interações para melhorar continuamente."
    },
    {
      icon: <Security />,
      title: "Segurança",
      description: "Proteção de dados e conformidade com regulamentações de privacidade."
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Seção Hero */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Sistema Avançado de Chatbot para WhatsApp
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Automatize suas conversas com inteligência artificial e fluxos personalizados
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              component={RouterLink} 
              to="/register"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                fontWeight: 'bold',
                py: 1.5,
                px: 4,
                '&:hover': {
                  bgcolor: '#f0f0f0'
                }
              }}
            >
              Começar Agora
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={RouterLink} 
              to="/login"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                fontWeight: 'bold',
                py: 1.5,
                px: 4,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Entrar
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Seção de Recursos */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold" sx={{ mb: 6 }}>
            Recursos Poderosos para sua Automação
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 2, fontSize: '2.5rem' }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Seção Como Funciona */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold" sx={{ mb: 6 }}>
            Como Funciona
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    1
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Configure seu Bot
                    </Typography>
                    <Typography color="text.secondary">
                      Conecte sua conta do WhatsApp e personalize as configurações do seu bot.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    2
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Crie seus Fluxos
                    </Typography>
                    <Typography color="text.secondary">
                      Utilize nosso editor visual para criar fluxos de conversação personalizados.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    3
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Automatize Conversas
                    </Typography>
                    <Typography color="text.secondary">
                      Deixe nosso sistema responder automaticamente às perguntas mais comuns.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    4
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Analise Resultados
                    </Typography>
                    <Typography color="text.secondary">
                      Monitore o desempenho e otimize continuamente suas automações.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Aqui pode ir uma imagem/ilustração */}
              <Box 
                sx={{ 
                  height: '100%', 
                  minHeight: 300, 
                  bgcolor: 'grey.200', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'grey.500'
                }}
              >
                Ilustração do Processo
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Seção Final CTA */}
      <Box sx={{ py: 8, bgcolor: 'primary.light', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Pronto para transformar sua comunicação?
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
            Junte-se a milhares de empresas que já automatizaram suas conversas
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            component={RouterLink} 
            to="/register"
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              fontWeight: 'bold',
              py: 1.5,
              px: 4,
              fontSize: '1.1rem'
            }}
          >
            Criar Conta Gratuitamente
          </Button>
        </Container>
      </Box>

      {/* Rodapé */}
      <Box sx={{ py: 4, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Sistema de Chatbot
              </Typography>
              <Typography color="text.secondary">
                Automatize suas conversas do WhatsApp com inteligência artificial.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MuiLink component={RouterLink} to="/login" color="text.secondary">
                  Entrar
                </MuiLink>
                <MuiLink component={RouterLink} to="/register" color="text.secondary">
                  Registrar
                </MuiLink>
                <MuiLink href="#" color="text.secondary">
                  Termos de Serviço
                </MuiLink>
                <MuiLink href="#" color="text.secondary">
                  Política de Privacidade
                </MuiLink>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Contato
              </Typography>
              <Typography color="text.secondary">
                Email: contato@chatbotsystem.com
              </Typography>
              <Typography color="text.secondary">
                Telefone: (11) 99999-9999
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © {new Date().getFullYear()} Sistema de Chatbot para WhatsApp. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;