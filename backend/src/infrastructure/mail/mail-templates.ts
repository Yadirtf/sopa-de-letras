/**
 * Plantillas HTML de WordHive (US-26).
 * Un solo layout con la paleta "Bioluminiscencia Nocturna"; cada correo solo
 * aporta su contenido. Estilos en linea porque Gmail/Outlook ignoran <style>.
 * Todo texto dinamico pasa por `escapeHtml` (los nombres los escribe el usuario).
 */
export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(accent: string, heading: string, body: string): string {
  return `
  <div style="background:#080B14;padding:24px 12px;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:auto;background:#0F1623;border-radius:16px;overflow:hidden;border:1px solid #7C3AED33;">
      <div style="height:6px;background:${accent};"></div>
      <div style="padding:28px 28px 8px;">
        <p style="margin:0 0 4px;font-size:13px;letter-spacing:2px;color:#06B6D4;font-weight:bold;">🐝 WORDHIVE</p>
        <h1 style="margin:0 0 16px;font-family:Outfit,Arial,sans-serif;font-size:24px;color:#F0F4FF;">${heading}</h1>
        ${body}
      </div>
      <p style="margin:0;padding:16px 28px 24px;font-size:12px;color:#8892A4;">
        Recibes este correo porque tienes una cuenta en WordHive. Si no reconoces esta actividad, responde a este mensaje.
      </p>
    </div>
  </div>`;
}

const paragraph = (text: string) =>
  `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#C9D1E0;">${text}</p>`;

export function welcomeMail(rawName: string): RenderedMail {
  const name = escapeHtml(rawName);
  const tips = ["🔎 Explora sopas por tema y dificultad", "🎮 Crea una sala y comparte el código", "👋 Agrega amigos e invítalos con un toque"]
    .map((t) => `<li style="margin-bottom:8px;">${t}</li>`)
    .join("");
  return {
    subject: `¡Bienvenido a WordHive, ${rawName}! 🐝`,
    html: layout(
      "#7C3AED",
      `¡Hola, ${name}! Ya eres parte de la colmena`,
      paragraph("Tu cuenta está lista. Con tu PIN de 4 dígitos entras en segundos desde cualquier dispositivo.") +
        `<ul style="padding-left:20px;color:#F0F4FF;font-size:15px;line-height:1.5;">${tips}</ul>`
    ),
    text: `¡Hola, ${rawName}! Tu cuenta de WordHive está lista. Explora sopas, crea salas y agrega amigos para jugar juntos.`,
  };
}

export function otpMail(otpCode: string): RenderedMail {
  const code = escapeHtml(otpCode);
  return {
    subject: `Tu código de WordHive: ${otpCode}`,
    html: layout(
      "#06B6D4",
      "Código para recuperar tu PIN",
      paragraph("Escribe este código en la app para crear un PIN nuevo:") +
        `<div style="text-align:center;background:#151D2E;border:1px solid #7C3AED;border-radius:12px;padding:20px;margin:8px 0 18px;">
           <span style="font-family:'JetBrains Mono',monospace;font-size:36px;letter-spacing:10px;color:#F59E0B;font-weight:bold;">${code}</span>
         </div>` +
        paragraph("El código vence en 10 minutos. Si no lo pediste, puedes ignorar este correo.")
    ),
    text: `Tu código para recuperar el PIN de WordHive es ${otpCode}. Vence en 10 minutos.`,
  };
}

export function pinChangedMail(rawName: string, changedAt: Date): RenderedMail {
  const name = escapeHtml(rawName);
  const when = changedAt.toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
  return {
    subject: "🔒 Tu PIN de WordHive cambió",
    html: layout(
      "#F43F5E",
      "Alerta de seguridad",
      paragraph(`Hola, ${name}. El PIN de tu cuenta se cambió el <strong style="color:#F0F4FF;">${when} (UTC)</strong>.`) +
        paragraph("Si fuiste tú, todo está bien. Si no, entra a la app y usa <strong style=\"color:#F0F4FF;\">«Olvidé mi PIN»</strong> de inmediato.")
    ),
    text: `Hola, ${rawName}. El PIN de tu cuenta WordHive cambió el ${when} (UTC). Si no fuiste tú, usa «Olvidé mi PIN» en la app.`,
  };
}
