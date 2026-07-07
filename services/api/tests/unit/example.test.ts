/**
 * Example Unit Tests
 * Shows testing patterns and best practices
 */

import { generateTestToken, generateAdminToken } from '../helpers/test-utils';

describe('Unit Tests - Example', () => {
  describe('Token Generation', () => {
    it('should generate valid JWT token', () => {
      const token = generateTestToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate token with correct payload', () => {
      const token = generateTestToken({
        role: 'admin',
      });

      expect(token).toBeDefined();
      // Token contains admin role
      expect(token).toContain('admin');
    });

    it('should generate admin token with admin role', () => {
      const token = generateAdminToken();
      expect(token).toBeDefined();
      expect(token).toContain('admin');
    });

    it('should override default token properties', () => {
      const customEmail = 'custom@example.com';
      const token = generateTestToken({ email: customEmail });

      expect(token).toBeDefined();
      expect(token).toContain(customEmail);
    });
  });

  describe('Basic Math', () => {
    it('should add numbers correctly', () => {
      expect(2 + 2).toBe(4);
    });

    it('should handle negative numbers', () => {
      expect(-1 + 1).toBe(0);
      expect(-5 - 5).toBe(-10);
    });
  });

  describe('String Operations', () => {
    it('should uppercase strings', () => {
      const str = 'hello';
      expect(str.toUpperCase()).toBe('HELLO');
    });

    it('should check string includes', () => {
      const str = 'wise2-api';
      expect(str).toContain('wise2');
      expect(str).toContain('api');
    });
  });

  describe('Array Operations', () => {
    it('should filter arrays correctly', () => {
      const arr = [1, 2, 3, 4, 5];
      const filtered = arr.filter((x) => x > 2);
      expect(filtered).toEqual([3, 4, 5]);
    });

    it('should map array values', () => {
      const arr = [1, 2, 3];
      const doubled = arr.map((x) => x * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });
  });

  describe('Object Operations', () => {
    it('should create and merge objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3 };
      const merged = { ...obj1, ...obj2 };

      expect(merged).toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
    });

    it('should access nested properties', () => {
      const obj = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      expect(obj.user.name).toBe('John');
      expect(obj.user.email).toBe('john@example.com');
    });
  });
});
