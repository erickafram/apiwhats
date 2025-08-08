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
  Link as MuiLink,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  AutoAwesome,
  Chat,
  Timeline,
  SmartToy,
  Speed,
  Security,
  Check,
  Star,
  TrendingUp,
  Support,
  Analytics,
  Group,
  WhatsApp,
  Phone,
  Email,
  Rocket,
  Shield,
  Psychology,
  Hub,
  CloudDone,
  BusinessCenter,
  VerifiedUser,
  Insights,
  Campaign,
  HeadsetMic,
  FormatQuote
} from '@mui/icons-material';

const LandingPage = () => {
  // Dados dos depoimentos
  const testimonials = [
    {
      name: "Carlos Silva",
      position: "CEO, TechStart",
      company: "E-commerce",
      avatar: "CS",
      rating: 5,
      text: "Aumentamos nossas vendas em 340% em apenas 3 meses. A automação com IA é impressionante e o suporte é excepcional.",
      results: "340% aumento em vendas"
    },
    {
      name: "Marina Costa",
      position: "Diretora de Marketing",
      company: "Fashion Trends",
      avatar: "MC",
      rating: 5,
      text: "A plataforma transformou nosso atendimento. Agora respondemos 24/7 e nossos clientes estão muito mais satisfeitos.",
      results: "95% satisfação do cliente"
    },
    {
      name: "Roberto Santos",
      position: "Gerente de Vendas",
      company: "AutoParts Brasil",
      avatar: "RS",
      rating: 5,
      text: "Reduzimos o tempo de resposta de horas para segundos. Nossa equipe agora foca em vendas complexas enquanto a IA cuida do básico.",
      results: "90% redução no tempo de resposta"
    }
  ];

  // Dados das perguntas frequentes
  const faqs = [
    {
      question: "Como funciona a integração com WhatsApp Business API?",
      answer: "Nossa equipe técnica cuida de toda a configuração. Em até 24h seu chatbot estará funcionando perfeitamente integrado ao WhatsApp oficial."
    },
    {
      question: "Preciso saber programar para criar os fluxos?",
      answer: "Não! Nossa interface visual permite criar fluxos complexos apenas arrastando e soltando elementos. É intuitivo como montar um quebra-cabeças."
    },
    {
      question: "A IA realmente entende o contexto da minha empresa?",
      answer: "Sim! Treinamos a IA com informações específicas da sua empresa, produtos e serviços. Ela aprende continuamente com cada interação."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Claro! Não temos fidelidade. Você pode cancelar quando quiser sem multas ou taxas adicionais."
    },
    {
      question: "Quanto tempo leva para ver resultados?",
      answer: "A maioria dos nossos clientes vê melhorias significativas nas primeiras 2 semanas. Resultados completos aparecem em até 30 dias."
    }
  ];

  // Dados dos planos
  const plans = [
    {
      name: "Starter",
      price: "599,00",
      originalPrice: "799,00",
      period: "/mês",
      description: "Perfeito para pequenas empresas e empreendedores",
      popular: false,
      badge: "Mais Econômico",
      features: [
        "✅ 1 usuário incluído",
        "📱 1 WhatsApp API Oficial",
        "💬 500 conversas/mês incluídas",
        "🤖 Chatbot inteligente",
        "📊 Relatórios básicos",
        "🎨 Editor visual de fluxos",
        "📞 Suporte via email",
        "📋 Templates prontos",
        "🔄 Integrações básicas"
      ],
      color: "primary",
      buttonText: "Começar Agora",
      highlight: "Ideal para começar"
    },
    {
      name: "Professional",
      price: "1.199,00",
      originalPrice: "1.499,00",
      period: "/mês",
      description: "Para empresas em crescimento que querem escalar",
      popular: true,
      badge: "Recomendado",
      features: [
        "✅ 5 usuários incluídos",
        "📱 Múltiplos WhatsApp API",
        "💬 2.000 conversas/mês incluídas",
        "🧠 IA com processamento avançado",
        "📱 App mobile (iOS/Android)",
        "🎯 Chat ao vivo profissional",
        "📈 Analytics detalhados",
        "📢 Campanhas em massa",
        "🔗 API de integração",
        "⚡ Suporte prioritário",
        "🎨 Personalização avançada"
      ],
      color: "secondary",
      buttonText: "Mais Popular",
      highlight: "Melhor custo-benefício"
    },
    {
      name: "Enterprise",
      price: "2.499,00",
      originalPrice: "2.999,00",
      period: "/mês",
      description: "Solução completa para grandes corporações",
      popular: false,
      badge: "Mais Completo",
      features: [
        "✅ 15 usuários incluídos",
        "📱 WhatsApp API ilimitado",
        "💬 5.000 conversas/mês incluídas",
        "🤖 IA Generativa (GPT-4)",
        "📱 App mobile premium",
        "📊 Business Intelligence",
        "🔧 Integrações customizadas",
        "📢 Campanhas ilimitadas",
        "🔗 API completa",
        "🏆 Suporte 24/7",
        "👨‍💼 Gerente dedicado",
        "🎓 Treinamento personalizado",
        "🔒 Segurança enterprise"
      ],
      color: "primary",
      buttonText: "Falar com Especialista",
      highlight: "Máximo desempenho"
    }
  ];

  // Dados dos recursos
  const features = [
    {
      icon: <Psychology />,
      title: "IA Generativa Avançada",
      description: "Powered by GPT-4, nossa IA entende contexto, sentimentos e responde como um humano especializado em vendas.",
      color: "#8B5CF6"
    },
    {
      icon: <Rocket />,
      title: "Automação Inteligente",
      description: "Fluxos visuais que se adaptam automaticamente ao comportamento do cliente, aumentando conversões.",
      color: "#06B6D4"
    },
    {
      icon: <Hub />,
      title: "Integração Total",
      description: "Conecte com CRM, ERP, e-commerce e mais de 1000 aplicações via API ou Zapier.",
      color: "#10B981"
    },
    {
      icon: <Insights />,
      title: "Analytics Preditivo",
      description: "Dashboard com IA que prevê tendências, identifica oportunidades e otimiza performance automaticamente.",
      color: "#F59E0B"
    },
    {
      icon: <Shield />,
      title: "Segurança Enterprise",
      description: "Certificação ISO 27001, criptografia end-to-end e conformidade total com LGPD e GDPR.",
      color: "#EF4444"
    },
    {
      icon: <HeadsetMic />,
      title: "Suporte White Glove",
      description: "Equipe dedicada de especialistas, onboarding personalizado e success manager exclusivo.",
      color: "#8B5CF6"
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Seção Hero */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #0F0C29 0%, #302b63 50%, #24243e 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(37, 211, 102, 0.1)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              borderRadius: '50px',
              px: 3,
              py: 1,
              mb: 4,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#25D366',
                animation: 'pulse 2s infinite'
              }}
            />
            <Typography variant="body2" sx={{ color: '#25D366', fontWeight: 600 }}>
              🚀 Nova IA GPT-4 Turbo Disponível
          </Typography>
          </Box>
          
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
              fontWeight: 900,
              mb: 3,
              background: 'linear-gradient(135deg, #fff 0%, #25D366 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}
          >
            Venda Mais com
            <br />
            <Box component="span" sx={{ color: '#25D366' }}>
              IA no WhatsApp
            </Box>
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontSize: { xs: '1.2rem', md: '1.8rem' },
              fontWeight: 300,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.4
            }}
          >
            A primeira plataforma que combina{' '}
            <Box component="span" sx={{ color: '#25D366', fontWeight: 600 }}>
              IA Generativa
            </Box>
            {' '}com automação avançada para{' '}
            <Box component="span" sx={{ color: '#25D366', fontWeight: 600 }}>
              multiplicar suas vendas
            </Box>
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 6, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                4.9/5 estrelas
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser sx={{ color: '#25D366', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +1000 empresas
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#25D366', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +340% vendas
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              component={RouterLink} 
              to="/register"
              startIcon={<Rocket />}
              sx={{ 
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: 'white',
                fontWeight: 700,
                py: 2.5,
                px: 6,
                fontSize: '1.2rem',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(37, 211, 102, 0.4)',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 40px rgba(37, 211, 102, 0.5)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Teste Grátis por 14 Dias
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<Phone />}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 600,
                py: 2.5,
                px: 6,
                fontSize: '1.1rem',
                borderRadius: '50px',
                backdropFilter: 'blur(10px)',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.5)',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Agendar Demo
            </Button>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 4, 
              opacity: 0.7,
              fontSize: '0.9rem'
            }}
          >
            ✅ Sem cartão de crédito • ✅ Setup em 24h • ✅ Suporte brasileiro
          </Typography>
        </Container>
        
        {/* Elementos decorativos animados */}
        <Box
          className="blob"
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            opacity: 0.1,
            zIndex: 1
          }}
        />
        <Box
          className="blob"
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '250px',
            height: '250px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1,
            zIndex: 1,
            animationDelay: '2s'
          }}
        />
        <Box
          className="blob"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            opacity: 0.05,
            zIndex: 1,
            animationDelay: '4s'
          }}
        />
      </Box>

      {/* Seção de Planos e Preços */}
      <Box sx={{ py: 15, bgcolor: '#fafbfc', position: 'relative' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 10 }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="900"
              sx={{ 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #1a202c 0%, #25D366 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Planos que Escalam com Você
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontWeight: 300,
                lineHeight: 1.6
              }}
            >
              Escolha o plano ideal para sua empresa e comece a vender mais hoje mesmo
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Chip 
                icon={<VerifiedUser />} 
                label="WhatsApp API Oficial" 
                sx={{ 
                  bgcolor: '#e8f5e8', 
                  color: '#25D366',
                  fontWeight: 600
                }} 
              />
              <Chip 
                icon={<Shield />} 
                label="Setup Gratuito" 
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  fontWeight: 600
                }} 
              />
              <Chip 
                icon={<HeadsetMic />} 
                label="Suporte Brasileiro" 
                sx={{ 
                  bgcolor: '#fff3e0', 
                  color: '#f57c00',
                  fontWeight: 600
                }} 
              />
            </Box>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  className="hover-lift"
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? '#25D366' : 'rgba(0,0,0,0.1)',
                    borderRadius: 4,
                    overflow: 'visible',
                    background: plan.popular 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)'
                      : '#ffffff',
                    boxShadow: plan.popular 
                      ? '0 10px 40px rgba(37, 211, 102, 0.15)'
                      : '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  {plan.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -1,
                        left: -1,
                        right: -1,
                        height: 4,
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        borderRadius: '16px 16px 0 0'
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 5 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Chip
                        label={plan.badge}
                        size="small"
                        sx={{
                          mb: 2,
                          bgcolor: plan.popular ? '#25D366' : '#f5f5f5',
                          color: plan.popular ? 'white' : '#666',
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {plan.name}
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3, 
                          minHeight: '48px',
                          fontSize: '1.1rem',
                          lineHeight: 1.5
                        }}
                      >
                        {plan.description}
                      </Typography>
                      
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              textDecoration: 'line-through',
                              color: 'text.disabled',
                              fontSize: '1.1rem'
                            }}
                          >
                            R$ {plan.originalPrice}
                          </Typography>
                          <Chip 
                            label="25% OFF" 
                            size="small" 
                            color="error" 
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                          <Typography variant="h5" sx={{ mr: 0.5, color: '#666' }}>R$</Typography>
                          <Typography 
                            variant="h1" 
                            fontWeight="900" 
                            sx={{
                              fontSize: '3rem',
                              color: plan.popular ? '#25D366' : '#1a202c'
                            }}
                          >
                            {plan.price}
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                            {plan.period}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="primary.main" 
                          sx={{ 
                            mt: 1, 
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          {plan.highlight}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box 
                          key={featureIndex} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            py: 0.8,
                            borderBottom: featureIndex < plan.features.length - 1 ? '1px solid #f0f0f0' : 'none'
                          }}
                        >
                          <Typography 
                            sx={{ 
                              fontSize: '1rem',
                              lineHeight: 1.5,
                              color: '#2d3748'
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    
                    <Button
                      variant={plan.popular ? "contained" : "outlined"}
                      size="large"
                      fullWidth
                      component={RouterLink}
                      to="/register"
                      sx={{
                        py: 2,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        borderRadius: '50px',
                        textTransform: 'none',
                        ...(plan.popular ? {
                          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.3)',
                          '&:hover': {
                            boxShadow: '0 12px 35px rgba(37, 211, 102, 0.4)',
                            transform: 'translateY(-2px)'
                          }
                        } : {
                          borderColor: '#25D366',
                          color: '#25D366',
                          '&:hover': {
                            bgcolor: 'rgba(37, 211, 102, 0.05)',
                            borderColor: '#25D366'
                          }
                        }),
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {plan.buttonText}
            </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
              🎯 Garantia de Resultados
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#25D366' }}>
                  ✅ 14 dias grátis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Teste sem compromisso
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#25D366' }}>
                  ✅ Setup em 24h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Funcionando rapidamente
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#25D366' }}>
                  ✅ Suporte premium
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Equipe especializada
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Precisa de um plano customizado? {' '}
              <MuiLink 
                href="#" 
                sx={{ 
                  color: '#25D366', 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Fale com nosso time
              </MuiLink>
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Seção de Recursos */}
      <Box sx={{ py: 15, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 10 }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="900"
              sx={{ 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #1a202c 0%, #25D366 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Tecnologia de Ponta
          </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontWeight: 300,
                lineHeight: 1.6
              }}
            >
              Recursos avançados que colocam sua empresa na frente da concorrência
            </Typography>
          </Box>
          
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  className="hover-lift"
                  sx={{ 
                    height: '100%', 
                    p: 5,
                    border: 'none',
                    borderRadius: 4,
                    background: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}aa 100%)`
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}25 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      color: feature.color,
                      fontSize: '2.5rem'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    gutterBottom 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2,
                      fontSize: '1.5rem',
                      color: '#1a202c'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.7,
                      fontSize: '1.1rem'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box textAlign="center" sx={{ mt: 10 }}>
            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
              E muito mais recursos disponíveis...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Chip 
                icon={<CloudDone />} 
                label="99.9% Uptime" 
                sx={{ 
                  bgcolor: '#e8f5e8', 
                  color: '#25D366',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 3
                }} 
              />
              <Chip 
                icon={<BusinessCenter />} 
                label="Enterprise Ready" 
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 3
                }} 
              />
              <Chip 
                icon={<Campaign />} 
                label="Campanhas Ilimitadas" 
                sx={{ 
                  bgcolor: '#fce4ec', 
                  color: '#e91e63',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 3
                }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Seção de Depoimentos */}
      <Box sx={{ py: 15, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 10 }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="900"
              sx={{ 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #1a202c 0%, #25D366 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Resultados Reais
          </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontWeight: 300,
                lineHeight: 1.6
              }}
            >
              Veja como empresas como a sua estão multiplicando vendas
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  className="hover-lift"
                  sx={{ 
                    height: '100%', 
                    p: 4,
                    borderRadius: 4,
                    background: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                    <FormatQuote 
                      sx={{ 
                        fontSize: '3rem', 
                        color: '#25D366', 
                        opacity: 0.2,
                        transform: 'rotate(180deg)'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                    ))}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      fontSize: '1.1rem'
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      {testimonial.avatar}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box
                    sx={{
                      bgcolor: '#e8f5e8',
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      fontWeight="bold" 
                      sx={{ color: '#25D366' }}
                    >
                      {testimonial.results}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Seção Estatísticas */}
      <Box sx={{ py: 12, background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} textAlign="center">
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                1000+
              </Typography>
              <Typography variant="h6">
                Empresas Ativas
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                50M+
              </Typography>
              <Typography variant="h6">
                Mensagens Enviadas
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                98%
              </Typography>
              <Typography variant="h6">
                Satisfação dos Clientes
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                24/7
              </Typography>
              <Typography variant="h6">
                Suporte Disponível
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Seção Como Funciona */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            textAlign="center" 
            gutterBottom 
            fontWeight="bold" 
            sx={{ mb: 2 }}
          >
            Como <Box component="span" sx={{ color: 'primary.main' }}>Funciona</Box>
          </Typography>
          <Typography 
            variant="h6" 
            textAlign="center" 
            color="text.secondary" 
            sx={{ mb: 8, maxWidth: '600px', mx: 'auto' }}
          >
            Em apenas 4 passos simples, você terá seu chatbot funcionando perfeitamente
          </Typography>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}>
                    1
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Conecte seu WhatsApp
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Conecte sua conta do WhatsApp Business API de forma segura e rápida. Nosso time ajuda na configuração.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'secondary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}>
                    2
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Configure sua IA
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Treine sua inteligência artificial com informações sobre sua empresa e produtos para respostas personalizadas.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}>
                    3
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Crie seus Fluxos
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Use nosso editor visual para criar fluxos de conversação que guiam seus clientes até a compra.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: 'warning.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}>
                    4
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Monitore e Otimize
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Acompanhe métricas em tempo real e otimize continuamente para aumentar suas vendas.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '100%', 
                  minHeight: 500, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  p: 4
                }}
              >
                <Box>
                  <WhatsApp sx={{ fontSize: '4rem', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Interface Intuitiva
                  </Typography>
                  <Typography sx={{ mt: 1, opacity: 0.9 }}>
                    Editor visual drag-and-drop para criar fluxos sem programação
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Seção Final CTA */}
      <Box 
        sx={{ 
          py: 12, 
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            Comece Hoje Mesmo!
          </Typography>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ mb: 2, opacity: 0.9 }}
          >
            Transforme suas conversas em vendas
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ mb: 6, opacity: 0.8, maxWidth: '500px', mx: 'auto' }}
          >
            Mais de 1000 empresas já aumentaram suas vendas em até 300% com nossa plataforma
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large" 
            component={RouterLink} 
            to="/register"
              startIcon={<Star />}
            sx={{ 
                bgcolor: 'white', 
                color: '#25D366',
                fontWeight: 'bold',
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#f8f9fa',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Teste Grátis por 14 Dias
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<Phone />}
              sx={{ 
              color: 'white',
                borderColor: 'white',
              fontWeight: 'bold',
                py: 2,
              px: 4,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              (11) 99999-9999
          </Button>
          </Box>
          
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ✅ Sem compromisso
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ✅ Cancelamento gratuito
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ✅ Suporte especializado
              </Typography>
            </Box>
          </Box>
        </Container>
        
        {/* Elementos decorativos */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '5%',
            width: '100px',
            height: '100px',
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 1
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '80px',
            height: '80px',
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            zIndex: 1
          }}
        />
      </Box>

      {/* Rodapé */}
      <Box sx={{ py: 6, bgcolor: '#1a1a1a', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                <Box component="span" sx={{ color: '#25D366' }}>Chat</Box>Bot Pro
              </Typography>
              <Typography sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
                A plataforma mais completa para automatizar vendas e atendimento no WhatsApp com Inteligência Artificial.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  size="small"
                  sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                >
                  WhatsApp
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderColor: '#25D366', color: '#25D366' }}
                >
                  Telegram
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Produto
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Recursos
                </MuiLink>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Preços
                </MuiLink>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Integrações
                </MuiLink>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  API
                </MuiLink>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Empresa
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Sobre Nós
                </MuiLink>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Blog
                </MuiLink>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Carreiras
                </MuiLink>
                <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Parceiros
                </MuiLink>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Contato e Suporte
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#25D366' }} />
                  <Typography sx={{ opacity: 0.8 }}>
                    contato@chatbotpro.com.br
              </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: '#25D366' }} />
                  <Typography sx={{ opacity: 0.8 }}>
                    (11) 99999-9999
              </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <WhatsApp sx={{ color: '#25D366' }} />
                  <Typography sx={{ opacity: 0.8 }}>
                    Suporte 24/7 via WhatsApp
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} ChatBot Pro. Todos os direitos reservados.
          </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: '#25D366' } }}>
                Termos de Uso
              </MuiLink>
              <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: '#25D366' } }}>
                Privacidade
              </MuiLink>
              <MuiLink href="#" sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: '#25D366' } }}>
                LGPD
              </MuiLink>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;