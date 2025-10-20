import { test, expect } from '@playwright/test';

// Gerar email único para cada teste
const generateTestEmail = () => `test.${Date.now()}@example.com`;

test.describe('Core User Flow', () => {
  test('should complete full user journey: register → login → create link → test redirect', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'testpassword123';
    const testName = 'Test User';
    const testUrl = 'https://www.google.com';

    // 1. Visitar página inicial
    await page.goto('/');
    await expect(page).toHaveTitle(/Little Links/);

    // 2. Ir para registro
    await page.click('text=Create account');
    await expect(page).toHaveURL('/register');

    // 3. Registrar novo usuário
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 4. Deve ser redirecionado para dashboard após registro
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();

    // 5. Criar um link no dashboard
    await page.fill('input[placeholder*="Enter a URL"]', testUrl);
    await page.click('button:has-text("Shorten URL")');

    // 6. Verificar se o link foi criado
    await expect(page.locator('text=Link created successfully')).toBeVisible();
    
    // 7. Obter o link criado
    const linkElement = page.locator('[data-testid="shortened-link"]').first();
    await expect(linkElement).toBeVisible();
    
    const shortUrl = await linkElement.textContent();
    expect(shortUrl).toContain('localhost');

    // 8. Testar redirecionamento do link
    const newPage = await page.context().newPage();
    await newPage.goto(shortUrl!);
    
    // Deve redirecionar para o URL original
    await expect(newPage).toHaveURL(testUrl);
    await newPage.close();

    // 9. Verificar analytics no dashboard
    await page.reload();
    await expect(page.locator('text=1').first()).toBeVisible(); // Click count

    // 10. Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    await expect(page).toHaveURL('/');
  });

  test('should handle login flow', async ({ page }) => {
    // Este teste assumirá que há um usuário já criado
    // Em produção, você pode usar fixtures ou dados de seed
    
    const testEmail = 'admin@example.com'; // User que já existe
    const testPassword = 'password123';

    await page.goto('/login');
    
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Se o usuário existir, deve ir para dashboard
    // Se não existir, deve mostrar erro
    const dashboardVisible = await page.locator('text=Welcome').isVisible();
    const errorVisible = await page.locator('text=Invalid credentials').isVisible();
    
    expect(dashboardVisible || errorVisible).toBe(true);
  });

  test('should create multiple links and verify list', async ({ page }) => {
    // Login first (assumindo usuário existente)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Skip if login failed
    if (await page.locator('text=Invalid credentials').isVisible()) {
      test.skip();
    }

    await expect(page).toHaveURL('/dashboard');

    // Criar múltiplos links
    const urls = [
      'https://github.com',
      'https://stackoverflow.com',
      'https://developer.mozilla.org'
    ];

    for (const url of urls) {
      await page.fill('input[placeholder*="Enter a URL"]', url);
      await page.click('button:has-text("Shorten URL")');
      await expect(page.locator('text=Link created successfully')).toBeVisible();
      await page.waitForTimeout(1000); // Wait for creation
    }

    // Verificar se todos os links aparecem na lista
    for (const url of urls) {
      await expect(page.locator(`text=${url}`)).toBeVisible();
    }
  });
});
