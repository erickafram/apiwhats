const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Configurando Frontend React...\n');

try {
  // Verificar se o diretório frontend existe
  const frontendDir = path.join(process.cwd(), 'frontend');
  
  if (!fs.existsSync(frontendDir)) {
    console.log('📁 Criando diretório frontend...');
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Navegar para o diretório frontend
  process.chdir(frontendDir);

  // Verificar se package.json existe
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json não encontrado no diretório frontend');
    console.log('💡 Execute este script a partir do diretório raiz do projeto');
    process.exit(1);
  }

  // Instalar dependências
  console.log('📦 Instalando dependências do frontend...');
  console.log('   (Isso pode levar alguns minutos...)');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ Dependências instaladas com sucesso');
  } catch (error) {
    console.error('   ❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }

  // Criar diretórios necessários
  const directories = [
    'src/components/Common',
    'src/components/Layout',
    'src/pages/Auth',
    'src/pages/Dashboard',
    'src/pages/Bots',
    'src/pages/Flows',
    'src/pages/Templates',
    'src/pages/Conversations',
    'src/pages/Queue',
    'src/pages/Analytics',
    'src/pages/Settings',
    'src/hooks',
    'src/services',
    'src/utils',
    'src/store',
    'public'
  ];

  console.log('\n📁 Criando estrutura de diretórios...');
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ ${dir}`);
    } else {
      console.log(`   ⏭️  ${dir} (já existe)`);
    }
  });

  // Verificar se os arquivos principais existem
  const requiredFiles = [
    'src/main.jsx',
    'src/App.jsx',
    'src/index.css',
    'index.html',
    'vite.config.js'
  ];

  console.log('\n📄 Verificando arquivos principais...');
  let missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (não encontrado)`);
      missingFiles.push(file);
    }
  });

  if (missingFiles.length > 0) {
    console.log('\n⚠️  Alguns arquivos estão faltando. Certifique-se de que todos os arquivos foram criados corretamente.');
  }

  console.log('\n🎉 Frontend configurado com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Certifique-se de que o backend está rodando (npm run dev)');
  console.log('   2. Em outro terminal, navegue para a pasta frontend:');
  console.log('      cd frontend');
  console.log('   3. Inicie o frontend:');
  console.log('      npm run dev');
  console.log('   4. Acesse: http://localhost:3000');
  
  console.log('\n🚀 Para iniciar o desenvolvimento:');
  console.log('   Terminal 1: npm run dev (backend na porta 5000)');
  console.log('   Terminal 2: cd frontend && npm run dev (frontend na porta 3000)');

} catch (error) {
  console.error('\n❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
