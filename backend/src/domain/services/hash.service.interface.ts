/**
 * Contrato para servicios de hash criptografico (ej: bcrypt).
 */
export interface IHashService {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
