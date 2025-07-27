import { BcryptService } from './bcrypt.service';
import * as bcrypt from 'bcrypt';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(() => {
    service = new BcryptService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createHash', () => {
    it('should create a hash of the given value', async () => {
      const value = 'myPassword';
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const result = await service.createHash(value);
      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(value, 10);
    });
  });

  describe('compare', () => {
    it('should return true if values match', async () => {
      const toBeCompared = 'myPassword';
      const encryptedValue = 'hashedPassword123';
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.compare(toBeCompared, encryptedValue);
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(toBeCompared, encryptedValue);
    });

    it('should return false if values do not match', async () => {
      const toBeCompared = 'wrongPassword';
      const encryptedValue = 'hashedPassword123';
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.compare(toBeCompared, encryptedValue);
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(toBeCompared, encryptedValue);
    });
  });
});
