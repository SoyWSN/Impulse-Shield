import { describe, it, expect } from 'vitest';
import { validateImpulseInput, MAX_PRODUCT_NAME_LENGTH, MAX_PRICE } from '../impulseService';

describe('validateImpulseInput', () => {
  it('accepts valid input', () => {
    const result = validateImpulseInput('Audífonos Sony', 1500, 60);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects empty product name', () => {
    const result = validateImpulseInput('   ', 1500, 60);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/nombre/i);
  });

  it('rejects product name exceeding character limit (40 chars)', () => {
    const longName = 'A'.repeat(MAX_PRODUCT_NAME_LENGTH + 1);
    const result = validateImpulseInput(longName, 500, 60);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/40 caracteres/i);

    const boundaryName = 'A'.repeat(MAX_PRODUCT_NAME_LENGTH);
    const validResult = validateImpulseInput(boundaryName, 500, 60);
    expect(validResult.valid).toBe(true);
  });

  it('rejects non-positive price', () => {
    const result = validateImpulseInput('Audífonos', 0, 60);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/precio/i);

    const negativeResult = validateImpulseInput('Audífonos', -50, 60);
    expect(negativeResult.valid).toBe(false);
  });

  it('rejects price exceeding maximum limit ($1,000,000 MXN)', () => {
    const result = validateImpulseInput('Audífonos', MAX_PRICE + 1, 60);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/1,000,000/i);

    const boundaryResult = validateImpulseInput('Audífonos', MAX_PRICE, 60);
    expect(boundaryResult.valid).toBe(true);
  });

  it('rejects invalid duration', () => {
    const result = validateImpulseInput('Audífonos', 500, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tiempo/i);
  });
});
