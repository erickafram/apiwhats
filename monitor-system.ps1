# Script de monitoramento do sistema para Windows
Write-Host "🔍 Verificando status do sistema..." -ForegroundColor Green

# Status do PM2
Write-Host "📊 Status PM2:" -ForegroundColor Yellow
pm2 status

# Uso de memória
Write-Host "💾 Uso de memória:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_OperatingSystem | Select-Object @{Name="TotalRAM(GB)";Expression={[math]::Round($_.TotalVisibleMemorySize/1MB,2)}}, @{Name="FreeRAM(GB)";Expression={[math]::Round($_.FreePhysicalMemory/1MB,2)}}

# Espaço em disco
Write-Host "💽 Espaço em disco:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}

# Logs recentes com erros
Write-Host "🚨 Erros recentes (últimas 20 linhas):" -ForegroundColor Red
pm2 logs chatbot-whats-api --err --lines 20

# Teste de conectividade do bot
Write-Host "🤖 Testando conectividade do bot:" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/bots/1/status" -Method GET
    Write-Host "Status do bot: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao conectar com o bot: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✅ Verificação concluída!" -ForegroundColor Green
