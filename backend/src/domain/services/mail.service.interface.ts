import { Email } from "../value-objects/email.vo";

export interface SendMailOptions {
  to: Email;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Contrato para envio de correos transaccionales (Nodemailer).
 */
export interface IMailService {
  sendMail(options: SendMailOptions): Promise<void>;
  sendWelcomeEmail(to: Email, name: string): Promise<void>;
  sendOtpEmail(to: Email, otpCode: string): Promise<void>;
  sendPinChangedAlert(to: Email, name: string): Promise<void>;
}
