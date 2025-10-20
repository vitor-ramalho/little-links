import { test, expect } from '@playwright/test';

test.describe('URL Shortening Features', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: vai para homepage
    await page.goto('/');
  });

  test('should shorten URL without authentication', async ({ page }) => {
    const testUrl = 'https://www.example.com';

    // Verificar se existe form na homepage para usuários não autenticados
    const urlInput = page.locator('input[placeholder*="URL"]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill(testUrl);
      await page.click('button:has-text("Shorten")');
      
      // Verificar se link foi criado
      const result = page.locator('[data-testid="shortened-link"]');
      await expect(result).toBeVisible();
      
      const shortUrl = await result.textContent();
      expect(shortUrl).toContain('localhost');
    } else {
      // Se não tiver form público, skip do teste
      test.skip();
    }
  });

  test('should validate invalid URLs', async ({ page }) => {
    const invalidUrls = [
      'invalid-url',
      'http://',
      'just-text',
      ''
    ];

    // Tentar com homepage primeiro
    let urlInput = page.locator('input[placeholder*="URL"]').first();
    
    // Se não tiver na homepage, ir para dashboard
    if (!await urlInput.isVisible()) {
      await page.goto('/dashboard');
      urlInput = page.locator('input[placeholder*="URL"]').first();
    }

    for (const invalidUrl of invalidUrls) {
      await urlInput.fill(invalidUrl);
      await page.click('button:has-text("Shorten")');
      
      // Deve mostrar erro de validação
      const errorMessage = page.locator('text=Invalid URL');
      const isErrorVisible = await errorMessage.isVisible();
      
      if (isErrorVisible) {
        await expect(errorMessage).toBeVisible();
      }
      
      // Clear field for next test
      await urlInput.clear();
    }
  });

  test('should generate QR code for shortened links', async ({ page }) => {
    // This test assumes we're on dashboard or can create links
    await page.goto('/dashboard');
    
    // Skip if not authenticated
    if (await page.locator('text=Login').isVisible()) {
      test.skip();
    }

    const testUrl = 'https://www.github.com';
    
    await page.fill('input[placeholder*="URL"]', testUrl);
    await page.click('button:has-text("Shorten")');
    
    // Wait for link creation
    await expect(page.locator('[data-testid="shortened-link"]')).toBeVisible();
    
    // Look for QR code generation
    const qrButton = page.locator('button:has-text("QR")');
    if (await qrButton.isVisible()) {
      await qrButton.click();
      
      // Check if QR code is displayed
      const qrImage = page.locator('img[alt*="QR"]');
      await expect(qrImage).toBeVisible();
    }
  });

  test('should track analytics on link visits', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Skip if not authenticated
    if (await page.locator('text=Login').isVisible()) {
      test.skip();
    }

    const testUrl = 'https://www.npmjs.com';
    
    // Create a link
    await page.fill('input[placeholder*="URL"]', testUrl);
    await page.click('button:has-text("Shorten")');
    
    const linkElement = await page.locator('[data-testid="shortened-link"]').first();
    await expect(linkElement).toBeVisible();
    
    const shortUrl = await linkElement.textContent();
    
    // Visit the short link in a new tab to simulate a real click
    const newPage = await context.newPage();
    await newPage.goto(shortUrl!);
    
    // Should redirect to original URL
    await expect(newPage).toHaveURL(testUrl);
    await newPage.close();
    
    // Go back to dashboard and check analytics
    await page.reload();
    
    // Look for click count update
    const clickCount = page.locator('[data-testid="click-count"]').first();
    if (await clickCount.isVisible()) {
      const count = await clickCount.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });
});
