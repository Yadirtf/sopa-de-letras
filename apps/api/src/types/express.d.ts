declare namespace Express {
  export interface Request {
    userId?: string;
    isGuest?: boolean;
  }
}
