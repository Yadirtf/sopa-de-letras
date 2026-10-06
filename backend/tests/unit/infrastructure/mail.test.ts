import { describe, it, expect, vi } from "vitest";
import { MailQueue } from "../../../src/infrastructure/mail/mail-queue";
import { escapeHtml, pinChangedMail, welcomeMail } from "../../../src/infrastructure/mail/mail-templates";

const silentLogger = { info: vi.fn(), error: vi.fn() };

describe("MailQueue (US-26)", () => {
  it("enqueue no espera al SMTP", () => {
    const send = vi.fn(() => new Promise(() => undefined));
    const scheduled: Array<() => void> = [];
    const queue = new MailQueue({ schedule: (fn) => scheduled.push(fn), logger: silentLogger });

    queue.enqueue({ description: "bienvenida", send });

    expect(send).not.toHaveBeenCalled();
    expect(queue.size).toBe(1);
  });

  it("reintenta con backoff exponencial y luego descarta", async () => {
    const send = vi.fn().mockRejectedValue(new Error("SMTP caido"));
    const delays: number[] = [];
    const queue = new MailQueue({
      maxAttempts: 3,
      baseDelayMs: 100,
      logger: silentLogger,
      schedule: (fn, ms) => {
        if (ms > 0) delays.push(ms);
        fn();
      },
    });

    queue.enqueue({ description: "otp", send });
    await vi.waitFor(() => expect(silentLogger.error).toHaveBeenCalled());

    expect(send).toHaveBeenCalledTimes(3);
    expect(delays).toEqual([100, 200]);
  });

  it("envia una sola vez cuando el SMTP responde", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const queue = new MailQueue({ logger: silentLogger, schedule: (fn) => fn() });
    queue.enqueue({ description: "pin", send });
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
  });
});

describe("Plantillas de correo", () => {
  it("escapa nombres escritos por usuarios", () => {
    expect(escapeHtml(`<b>"Ana" & 'Beto'</b>`)).toBe("&lt;b&gt;&quot;Ana&quot; &amp; &#39;Beto&#39;&lt;/b&gt;");
    expect(welcomeMail("<script>").html).not.toContain("<script>");
  });

  it("la alerta de PIN incluye fecha y version de texto plano", () => {
    const mail = pinChangedMail("Ana", new Date("2026-10-06T15:00:00Z"));
    expect(mail.subject).toContain("PIN");
    expect(mail.text).toContain("Ana");
    expect(mail.html).toContain("2026");
  });
});
