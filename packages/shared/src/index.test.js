import test from 'node:test';
import assert from 'node:assert';
import { ROLES, registerSchema, loginSchema } from './index.js';

test('ROLES constants are defined correctly', () => {
  assert.strictEqual(ROLES.CUSTOMER, 'customer');
  assert.strictEqual(ROLES.VENDOR, 'vendor');
  assert.strictEqual(ROLES.ADMIN, 'admin');
});

test('registerSchema validates correct data', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
    role: ROLES.CUSTOMER,
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
    },
  };
  const result = registerSchema.safeParse(validData);
  assert.strictEqual(result.success, true);
});

test('registerSchema rejects invalid email', () => {
  const invalidData = {
    email: 'not-an-email',
    password: 'password123',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
    },
  };
  const result = registerSchema.safeParse(invalidData);
  assert.strictEqual(result.success, false);
});

test('loginSchema validates correct data', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
  };
  const result = loginSchema.safeParse(validData);
  assert.strictEqual(result.success, true);
});
