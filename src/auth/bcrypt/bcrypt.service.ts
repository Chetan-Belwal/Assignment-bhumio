import { hash, compare } from 'bcrypt';

export class BcryptService {
  readonly #salts: number = 10;

  /**
   *  Create Hash
   * @param value
   * @returns
   */
  public async createHash(value: string): Promise<string> {
    return hash(value, this.#salts);
  }

  /**
   * compare values and validate
   * @param toBeCompared
   * @param encryptedValue
   * @returns
   */
  public async compare(
    toBeCompared: string,
    encryptedValue: string,
  ): Promise<boolean> {
    return await compare(toBeCompared, encryptedValue);
  }
}
