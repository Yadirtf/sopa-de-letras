import nodemailer, { Transporter } from "nodemailer";
import { Email } from "../../domain/value-objects/email.vo";
import { IMailService, SendMailOptions } from "../../domain/services/mail.service.interface";

export class NodemailerMailService implements IMailService {
  private transporter: Transporter;
  private readonly fromAddress: string;

  constructor(smtpConfig: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  }) {
    this.fromAddress = smtpConfig.from;
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"WordHive" <${this.fromAddress}>`,
        to: options.to.value,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (err) {
      console.error("[MailService Error] No se pudo despachar el correo:", err);
    }
  }

  async sendWelcomeEmail(to: Email, name: string): Promise<void> {
    const html = `
      <div style="background-color:#080B14; color:#F0F4FF; font-family:'Inter',sans-serif; padding:32px; border-radius:12px; max-width:600px; margin:auto;">
        <h1 style="color:#7C3AED; font-family:'Outfit',sans-serif; margin-bottom:12px;">¡Bienvenido a WordHive, ${name}!</h1>
        <p style="color:#8892A4; font-size:16px; line-height:1.6;">
          Tu cuenta ha sido creada exitosamente. Tu PIN numérico de 4 dígitos te permitirá acceder de forma instantánea desde cualquier dispositivo.
        </p>
        <div style="background-color:#151D2E; border:1px solid #7C3AED33; padding:16px; border-radius:8px; margin:24px 0;">
          <p style="margin:0; color:#06B6D4; font-weight:bold;">¡Listo para competir!</p>
          <p style="margin:4px 0 0; color:#8892A4; font-size:14px;">Crea salas multijugador, desafía a tus amigos y escala en el ranking.</p>
        </div>
      </div>
    `;
    await this.sendMail({ to, subject: "¡Bienvenido a WordHive!", html });
  }

  async sendOtpEmail(to: Email, otpCode: string): Promise<void> {
    const html = `
      <div style="background-color:#080B14; color:#F0F4FF; font-family:'Inter',sans-serif; padding:32px; border-radius:12px; max-width:600px; margin:auto;">
        <h2 style="color:#7C3AED; font-family:'Outfit',sans-serif;">Recuperación de PIN — WordHive</h2>
        <p style="color:#8892A4;">Has solicitado restablecer tu PIN de acceso. Utiliza el siguiente código temporal:</p>
        <div style="background-color:#151D2E; text-align:center; padding:20px; border-radius:8px; margin:24px 0; border:1px solid #7C3AED;">
          <span style="font-family:'JetBrains Mono',monospace; font-size:36px; letter-spacing:10px; color:#F59E0B; font-weight:bold;">${otpCode}</span>
        </div>
        <p style="color:#8892A4; font-size:13px;">Este código expirará en 10 minutos. Si no solicitaste este cambio, ignora este mensaje.</p>
      </div>
    `;
    await this.sendMail({ to, subject: `Código de recuperación: ${otpCode}`, html });
  }

  async sendPinChangedAlert(to: Email, name: string): Promise<void> {
    const html = `
      <div style="background-color:#080B14; color:#F0F4FF; font-family:'Inter',sans-serif; padding:32px; border-radius:12px; max-width:600px; margin:auto;">
        <h2 style="color:#F43F5E;">Alerta de Seguridad WordHive</h2>
        <p style="color:#8892A4;">Hola ${name}, te notificamos que el PIN de tu cuenta ha sido actualizado recientemente.</p>
        <p style="color:#8892A4; font-size:13px;">Si no realizaste este cambio, por favor restablece tu PIN de inmediato.</p>
      </div>
    `;
    await this.sendMail({ to, subject: "Alerta de Seguridad: PIN actualizado", html });
  }
}
