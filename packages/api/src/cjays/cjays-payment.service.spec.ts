import { BadRequestException } from '@nestjs/common';
import { cjaysPriceToCents } from './cjays-payment.service';

describe('CJAYS Stripe payment amounts', () => {
  it('converts display prices into exact integer cents', () => {
    expect(cjaysPriceToCents('$1,249.95')).toBe(124995);
    expect(cjaysPriceToCents('50')).toBe(5000);
  });

  it.each(['', 'free', '12.345', '-1', '0.10'])('rejects unsafe amount %s', (value) => {
    expect(() => cjaysPriceToCents(value)).toThrow(BadRequestException);
  });
});
