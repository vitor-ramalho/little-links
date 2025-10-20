import { test, expect } from '@playwright/test';

test.describe('Sistema Funcionando - Demonstração Simplificada', () => {
  test('deve carregar a página inicial e testar API', async ({ page }) => {
    // 1. Carregar página inicial
    await page.goto('/');
    
    // Verificar título correto
    await expect(page).toHaveTitle(/Little Links/);
    console.log('✅ Título da página correto');
    
    // 2. Testar conectividade da API
    const healthResponse = await page.request.get('http://localhost:3000/health');
    expect(healthResponse.status()).toBe(200);
    console.log('✅ API health check passou');
    
    const infoResponse = await page.request.get('http://localhost:3000/info');
    expect(infoResponse.status()).toBe(200);
    const infoData = await infoResponse.json();
    expect(infoData.name).toBe('Little Link API');
    console.log('✅ API info endpoint funciona');
    
    // 3. Verificar se há botão de Create account
    const createAccountBtn = page.locator('text=Create account');
    await expect(createAccountBtn).toBeVisible();
    console.log('✅ Botão "Create account" encontrado');
    
    // 4. Clicar no botão
    await createAccountBtn.click();
    await expect(page).toHaveURL(/register/);
    console.log('✅ Navegação para registro funciona');
    
    // 5. Verificar se o formulário está presente
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    console.log('✅ Formulário de registro presente');
    
    console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
  });
});
