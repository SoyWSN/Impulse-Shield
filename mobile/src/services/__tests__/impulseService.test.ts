import { describe, it, expect } from 'vitest';
import { validateImpulseInput } from '../impulseService';

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

  it('rejects non-positive price', () => {
    const result = validateImpulseInput('Audífonos', 0, 60);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/precio/i);

    const negativeResult = validateImpulseInput('Audífonos', -50, 60);
    expect(negativeResult.valid).toBe(false);
  });

  it('rejects invalid duration', () => {
    const result = validateImpulseInput('Audífonos', 500, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tiempo/i);
  });
});
