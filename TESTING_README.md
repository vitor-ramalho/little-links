# 🧪 Testing Guide - Little Links

> **"Teste automatizado = Preguiça inteligente!"** 🚀

## 🎯 Quick Start

### Para quem tem preguiça total (recomendado!):
```bash
# Executa TODOS os testes automaticamente
./test-automation.sh

# Modo rápido (só os essenciais)
./test-automation.sh --quick

# Se serviços já estão rodando
./test-automation.sh --skip-services
```

## 🧪 Tipos de Teste

### 1. **E2E Tests (End-to-End) - Prioridade MÁXIMA** 
**Testa como usuário real:**
```bash
cd web
npm run test:e2e              # Todos os E2E
npm run test:e2e:ui           # Com interface visual 
npm run test:e2e:headed       # Com browser visível
```

**O que testa:**
- ✅ Registro → Login → Dashboard
- ✅ Criar link → Testar redirecionamento
- ✅ Analytics tracking
- ✅ QR code generation
- ✅ Logout flow

### 2. **API Tests (Backend)**
**Testa todos os endpoints:**
```bash
cd api
npm run test                  # Unit tests
npm run test:e2e             # API E2E tests
npm run test:cov             # Com coverage
```

**O que testa:**
- ✅ Authentication endpoints
- ✅ Link CRUD operations
- ✅ URL redirection
- ✅ Analytics tracking
- ✅ Error handling

### 3. **Component Tests (Frontend)**
**Testa componentes isolados:**
```bash
cd web  
npm run test                  # Vitest
npm run test:watch           # Watch mode
```

## 🚦 Status dos Testes

### ✅ **Implementado:**
- E2E: Core user flows
- E2E: Authentication 
- E2E: URL shortening
- API: Complete flow test
- Component: Basic setup

### 🔄 **Em Progresso:**
- Performance tests
- Visual regression tests
- Accessibility tests

### 📋 **Próximos:**
- Load testing
- Security testing
- Browser compatibility

## 📊 Coverage Targets

- **E2E:** 100% dos fluxos críticos ✅
- **API:** >90% code coverage 🔄
- **Components:** >80% code coverage 🔄

## 🛠 Scripts Úteis

### Desenvolvimento
```bash
# Watch mode para desenvolvimento
npm run test:watch           # Components (web)
npm run test:e2e:ui         # E2E visual (web)

# Debug específico
npm run test:debug          # API debug mode
```

### CI/CD
```bash
# Para GitHub Actions
npm run test:all            # Todos os testes

# Para deployment
./test-automation.sh --quick
```

## 🐛 Debugging Testes

### E2E Falhou?
```bash
# Ver o que aconteceu
npm run test:e2e:headed     # Browser visível
npm run test:e2e:ui         # Interface debug
```

### API Falhou?
```bash
# Debug específico
npm run test:debug          # Com breakpoints
npm run test:e2e:watch     # Watch API E2E
```

### Component Falhou?
```bash
# Watch mode 
npm run test:watch         # Auto-reload
```

## 🎯 Test-Driven Development

### 1. **Red** - Escreva teste que falha
```typescript
test('should create premium link', () => {
  // Teste para funcionalidade que não existe ainda
});
```

### 2. **Green** - Implemente mínimo para passar
```typescript
// Código mínimo para o teste passar
```

### 3. **Refactor** - Melhore o código
```typescript
// Otimize mantendo os testes verdes
```

## 🚀 CI/CD Integration

### GitHub Actions (já configurado)
```yaml
# .github/workflows/test.yml
- name: Run all tests
  run: ./test-automation.sh --skip-services
```

### Pre-commit Hook (já configurado)
```bash
# Roda automaticamente antes de cada commit
npm run test:quick
```

## 📈 Métricas & Reports

### Test Reports
```bash
# Playwright reports
npx playwright show-report

# Jest coverage
open api/coverage/lcov-report/index.html
```

### Performance Metrics
- **E2E Tests:** ~3-5 min
- **API Tests:** ~30 sec  
- **Component Tests:** ~10 sec

## 💡 Dicas Pro

### 1. **Test First** 
Escreva testes antes do código - economiza tempo no longo prazo!

### 2. **Use Page Objects (E2E)**
```typescript
// pages/auth.page.ts
class AuthPage {
  async login(email: string, password: string) {
    // Reutilizable login logic
  }
}
```

### 3. **Mock External APIs**
```typescript
// Não dependa de APIs externas nos testes
jest.mock('external-service');
```

### 4. **Test Data Factories**
```typescript
// factories/user.factory.ts
export const createTestUser = () => ({
  email: `test.${Date.now()}@example.com`,
  password: 'testpass123'
});
```

## 🆘 Troubleshooting

### "Tests are flaky"
- Add explicit waits: `await page.waitForSelector()`
- Use `data-testid` attributes
- Avoid timing-dependent assertions

### "E2E too slow"
- Run in parallel: `fullyParallel: true`
- Use `--headed` only for debugging
- Optimize test data setup

### "API tests failing"
- Check database state
- Verify test isolation
- Clear test data between runs

---

## 🎯 **Bottom Line**

**Execute `./test-automation.sh` e vá tomar um café! ☕**

Se falhar, os testes te dizem exatamente o que consertar. Se passar, pode fazer deploy com confiança! 🚀
