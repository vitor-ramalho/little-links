// Mocking global objects or setting up test environment
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Create a more flexible FormData mock that better handles test cases
class MockFormData {
  private data: Record<string, any> = {};

  append(key: string, value: any): void {
    this.data[key] = value;
  }

  get(key: string): any {
    return this.data[key] ?? null;
  }

  has(key: string): boolean {
    return key in this.data;
  }

  delete(key: string): void {
    delete this.data[key];
  }
  
  getAll(key: string): any[] {
    return this.has(key) ? [this.get(key)] : [];
  }

  set(key: string, value: any): void {
    this.data[key] = value;
  }

  forEach(callbackfn: (value: any, key: string, parent: any) => void): void {
    Object.entries(this.data).forEach(([key, value]) => {
      callbackfn(value, key, this);
    });
  }

  *entries() {
    for (const [key, value] of Object.entries(this.data)) {
      yield [key, value];
    }
  }

  *keys() {
    for (const key of Object.keys(this.data)) {
      yield key;
    }
  }

  *values() {
    for (const value of Object.values(this.data)) {
      yield value;
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

// Use the mock class 
global.FormData = vi.fn().mockImplementation(() => {
  return new MockFormData();
}) as any;

// Mock next/headers cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
