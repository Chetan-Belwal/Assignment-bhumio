export {};
declare global {
  namespace Express {
    export interface Request {
      flash(type: string, message?: string): string[];
      flash(message: string): void;
    }
  }
}
