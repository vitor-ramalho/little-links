import { test, expect } from '@playwright/test';

test.describe('Quick Demo Test', () => {
  test('should load homepage and basic navigation', async ({ page }) => {
    // Test 1: Homepage loads
    await page.goto('/');
    await expect(page).toHaveTitle(/Little/);
    
    console.log('✅ Homepage loaded successfully');
    
    // Test 2: Can navigate to register
    await page.click('text=Create account');
    await expect(page).toHaveURL(/register/);
    
    console.log('✅ Registration page navigation works');
    
    // Test 3: Can navigate to login
    await page.click('text=Login');
    await expect(page).toHaveURL(/login/);
    
    console.log('✅ Login page navigation works');
    
    // Test 4: Form elements are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✅ Login form elements are present');
    
    console.log('🎉 All basic tests passed!');
  });
  
  test('should test API connectivity', async ({ page }) => {
    // Test API health endpoint
    const response = await page.request.get('http://localhost:3000/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData).toHaveProperty('status');
    
    console.log('✅ API health check passed');
    
    // Test API info endpoint
    const infoResponse = await page.request.get('http://localhost:3000/info');
    expect(infoResponse.status()).toBe(200);
    
    const infoData = await infoResponse.json();
    expect(infoData.name).toBe('Little Link API');
    
    console.log('✅ API info endpoint works');
    console.log(`📋 API Version: ${infoData.version}`);
    console.log(`🌍 Environment: ${infoData.environment}`);
  });
});
