import { Email } from './email.value-object';
import { DomainException } from '../exceptions/domain.exception';

describe('Email Value Object', () => {
  it('should create a valid email successfully and normalize to lowercase', () => {
    const email = Email.create('  TEST.USER@CAPITAL.MX  ');
    expect(email.value).toBe('test.user@capital.mx');
  });

  it('should throw DomainException if email is empty', () => {
    expect(() => Email.create('')).toThrow(DomainException);
    expect(() => Email.create('   ')).toThrow('Email cannot be empty');
  });

  it('should throw DomainException for invalid email format', () => {
    expect(() => Email.create('invalid-email')).toThrow('Invalid email address format');
    expect(() => Email.create('user@domain')).toThrow('Invalid email address format');
  });

  it('should evaluate equality correctly', () => {
    const email1 = Email.create('user@capital.mx');
    const email2 = Email.create('USER@CAPITAL.MX');
    const email3 = Email.create('other@capital.mx');

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});
