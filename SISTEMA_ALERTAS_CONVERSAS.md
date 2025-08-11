# 🔔 Sistema de Alertas de Conversas

## 📋 **Visão Geral**

Sistema completo de notificações visuais implementado para alertar operadores sobre conversas aguardando atendimento em toda a interface da aplicação.

## 🎯 **Funcionalidades Implementadas**

### **1. 🔔 Sino de Notificação no Topo**
- **Localização**: Header superior direito, ao lado do avatar do usuário
- **Indicador Visual**: Sino com badge mostrando número de conversas
- **Estados**:
  - 🔔 **Cinza**: Nenhuma conversa aguardando
  - 🟡 **Amarelo**: Conversas transferidas normais
  - 🔴 **Vermelho + Animação**: Conversas urgentes (>5 minutos)
- **Tooltip**: Informações detalhadas sobre conversas aguardando
- **Ação**: Clique redireciona para `/conversations`

### **2. 📊 Badge no Menu Lateral**
- **Localização**: Item "Conversas" no menu lateral esquerdo
- **Indicador Visual**: Badge no ícone + Chip com número
- **Estados**:
  - **Sem badge**: Nenhuma conversa aguardando
  - 🟡 **Badge Amarelo**: Conversas normais
  - 🔴 **Badge Vermelho + "!"**: Conversas urgentes com animação
- **Animação**: Pulso para conversas urgentes

### **3. 🚨 Alertas na Página de Conversas**
- **Snackbar Superior**: Alerta de conversas não atendidas há >5 minutos
- **Botão Flutuante**: Contador com animação para conversas urgentes
- **Header da Página**: Chip amarelo mostrando total não atendidas
- **Notificação de Nova Conversa**: Alert azul quando nova conversa chega

## 🛠️ **Implementação Técnica**

### **Hook Global de Estado (`useConversations.jsx`)**
```javascript
// Context compartilhado para toda aplicação
export const ConversationsProvider = ({ children }) => {
  const [transferredCount, setTransferredCount] = useState(0)
  const [unattendedCount, setUnattendedCount] = useState(0)
  
  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(loadConversationCounts, 10000)
    return () => clearInterval(interval)
  }, [])
}

export const useConversations = () => {
  // Retorna: transferredCount, unattendedCount, refreshConversations
}
```

### **Layout Principal (`Layout.jsx`)**
```javascript
// Sino no Header
<Tooltip title={`${transferredCount} conversa(s) aguardando...`}>
  <IconButton onClick={() => navigate('/conversations')}>
    <Badge badgeContent={transferredCount} color={unattendedCount > 0 ? "error" : "warning"}>
      {unattendedCount > 0 ? <NotificationsActive /> : <Notifications />}
    </Badge>
  </IconButton>
</Tooltip>
```

### **Menu Lateral (`Sidebar.jsx`)**
```javascript
// Badge no ícone de conversas
{item.path === '/conversations' && transferredCount > 0 ? (
  <Badge badgeContent={transferredCount} color={unattendedCount > 0 ? "error" : "warning"}>
    <Icon />
  </Badge>
) : (
  <Icon />
)}

// Chip com contador
{item.path === '/conversations' && transferredCount > 0 && (
  <Chip
    label={`${transferredCount}${unattendedCount > 0 ? '!' : ''}`}
    sx={{ animation: unattendedCount > 0 ? 'pulse 2s infinite' : 'none' }}
  />
)}
```

## 🎨 **Estados Visuais**

### **🟢 Estado Normal (0 conversas)**
- Sino cinza sem badge
- Menu sem indicadores
- Página limpa

### **🟡 Estado Ativo (conversas < 5min)**
- Sino azul com badge amarelo
- Menu com badge amarelo e chip
- Header com informações básicas

### **🔴 Estado Urgente (conversas > 5min)**
- Sino laranja com badge vermelho + animação
- Menu com badge vermelho + "!" + animação
- Botão flutuante pulsando
- Alertas visuais em múltiplos locais

## 📱 **Experiência do Usuário**

### **Fluxo de Notificação**
1. **Cliente** completa fluxo → **Transferido para operador**
2. **Sistema** detecta nova conversa → **Contadores atualizados**
3. **Interface** mostra alertas visuais → **Operador vê notificações**
4. **Operador** clica em qualquer alerta → **Redirecionado para conversas**
5. **Operador** assume conversa → **Contadores atualizados**

### **Múltiplos Pontos de Acesso**
- 🔔 **Sino no header**: Sempre visível
- 📊 **Badge no menu**: Contexto lateral
- 🚨 **Alertas na página**: Informações detalhadas
- 🎯 **Botão flutuante**: Ação rápida

## ⚡ **Performance e Atualização**

### **Auto-refresh Inteligente**
- **10 segundos**: Atualização global dos contadores
- **3 segundos**: Mensagens quando chat aberto
- **Condicional**: Para refresh quando chat ativo
- **Otimizado**: Apenas dados necessários

### **Estado Compartilhado**
- **Context API**: Estado global sem prop drilling
- **Hooks customizados**: Reutilização fácil
- **Memoização**: Performance otimizada

## 🎯 **Benefícios**

1. **👁️ Visibilidade Total**: Operador sempre sabe quando há conversas
2. **⚡ Resposta Rápida**: Múltiplos pontos de acesso
3. **🚨 Priorização**: Conversas urgentes se destacam
4. **🎨 UX Consistente**: Alertas em toda interface
5. **📊 Informações Claras**: Contadores e tooltips informativos
6. **🔄 Tempo Real**: Atualizações automáticas

## 🚀 **Próximas Melhorias**

- [ ] 🔊 Notificações sonoras
- [ ] 📧 Alertas por email para conversas muito antigas
- [ ] 🎯 Filtros por prioridade
- [ ] 📱 Notificações push no navegador
- [ ] 📈 Métricas de tempo de resposta
- [ ] 🏷️ Categorização por tipo de conversa

---

**✨ Sistema completamente implementado e funcionando em produção!**

### **URLs para Teste**
- **Painel Principal**: `https://chatbotwhats.online/dashboard`
- **Central de Conversas**: `https://chatbotwhats.online/conversations`
- **Qualquer página**: Sino sempre visível no topo

 