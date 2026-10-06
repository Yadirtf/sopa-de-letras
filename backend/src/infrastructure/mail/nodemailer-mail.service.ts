import nodemailer, { Transporter } from "nodemailer";
import { Email } from "../../domain/value-objects/email.vo";
import { IMailService, SendMailOptions } from "../../domain/services/mail.service.interface";
import { MailQueue } from "./mail-queue";
import { otpMail, pinChangedMail, RenderedMail, welcomeMail } from "./mail-templates";

/**
 * Correo transaccional WordHive (US-03, US-26).
 * Todos los metodos encolan y regresan al instante: el registro o el cambio
 * de PIN nunca esperan al servidor SMTP. Los reintentos viven en MailQueue.
 */
export class NodemailerMailService implements IMailService {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(
    smtpConfig: { host: string; port: number; user: string; pass: string; from: string },
    private readonly queue: MailQueue = new MailQueue()
  ) {
    this.fromAddress = smtpConfig.from;
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    this.queue.enqueue({
      description: `"${options.subject}" -> ${options.to.value}`,
      send: () =>
        this.transporter.sendMail({
          from: this.formatFrom(),
          to: options.to.value,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
    });
  }

  async sendWelcomeEmail(to: Email, name: string): Promise<void> {
    await this.sendRendered(to, welcomeMail(name));
  }

  async sendOtpEmail(to: Email, otpCode: string): Promise<void> {
    await this.sendRendered(to, otpMail(otpCode));
  }

  async sendPinChangedAlert(to: Email, name: string): Promise<void> {
    await this.sendRendered(to, pinChangedMail(name, new Date()));
  }

  private async sendRendered(to: Email, mail: RenderedMail): Promise<void> {
    await this.sendMail({ to, subject: mail.subject, html: mail.html, text: mail.text });
  }

  /** SMTP_FROM puede venir como "WordHive <x@y>" o solo "x@y"; evitamos duplicar el nombre. */
  private formatFrom(): string {
    return this.fromAddress.includes("<") ? this.fromAddress : `"WordHive" <${this.fromAddress}>`;
  }
}
