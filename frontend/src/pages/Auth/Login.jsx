import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'

import { useAuth } from '../../hooks/useAuth'

const Login = () => {
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    await login(data.email, data.password)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <WhatsAppIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                ChatBot System
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Faça login para acessar sua conta
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Não tem uma conta?{' '}
                  <Link component={RouterLink} to="/register" underline="hover">
                    Criar conta
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default Login
