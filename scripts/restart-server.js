const { exec } = require('child_process');
const os = require('os');

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = [];
          
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
              const pid = parts[4];
              if (pid && !isNaN(pid)) {
                pids.push(pid);
              }
            }
          });
          
          if (pids.length > 0) {
            console.log(`🔄 Matando processos na porta ${port}: ${pids.join(', ')}`);
            pids.forEach(pid => {
              exec(`taskkill /PID ${pid} /F`, (killError) => {
                if (killError) {
                  console.log(`   ⚠️  Erro ao matar PID ${pid}: ${killError.message}`);
                } else {
                  console.log(`   ✅ PID ${pid} finalizado`);
                }
              });
            });
          } else {
            console.log(`✅ Nenhum processo encontrado na porta ${port}`);
          }
        } else {
          console.log(`✅ Porta ${port} está livre`);
        }
        resolve();
      });
    } else {
      // Linux/Mac
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          if (pids.length > 0) {
            console.log(`🔄 Matando processos na porta ${port}: ${pids.join(', ')}`);
            exec(`kill -9 ${pids.join(' ')}`, (killError) => {
              if (killError) {
                console.log(`   ⚠️  Erro ao matar processos: ${killError.message}`);
              } else {
                console.log(`   ✅ Processos finalizados`);
              }
            });
          } else {
            console.log(`✅ Nenhum processo encontrado na porta ${port}`);
          }
        } else {
          console.log(`✅ Porta ${port} está livre`);
        }
        resolve();
      });
    }
  });
}

async function restartServer() {
  console.log('🔄 Reiniciando servidor...\n');
  
  // Matar processos na porta 5000
  await killProcessOnPort(5000);
  
  // Aguardar um pouco
  console.log('\n⏳ Aguardando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Iniciar servidor
  console.log('\n🚀 Iniciando servidor...');
  const serverProcess = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao iniciar servidor:', error);
      return;
    }
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  console.log('✅ Comando de inicialização executado');
  console.log('📋 Para testar o sistema:');
  console.log('   npm run test:minimal');
  console.log('   npm run test:system');
}

if (require.main === module) {
  restartServer();
}

module.exports = { killProcessOnPort, restartServer };
