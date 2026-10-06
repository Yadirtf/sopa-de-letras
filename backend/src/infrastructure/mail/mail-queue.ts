/**
 * Cola de correo en memoria, no bloqueante (US-26 / RNF-06).
 *
 * Por que no BullMQ: en el plan gratuito de Render hay una sola instancia y
 * Redis puede reiniciarse; una cola en proceso con reintentos exponenciales
 * cubre el caso real (picos del SMTP) sin otro worker ni otra dependencia.
 * `enqueue` vuelve de inmediato: el caso de uso nunca espera al SMTP.
 */
export interface MailJob {
  description: string;
  send: () => Promise<unknown>;
}

export interface MailQueueOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  schedule?: (fn: () => void, delayMs: number) => void;
  logger?: Pick<Console, "info" | "error">;
}

export class MailQueue {
  private readonly pending: Array<{ job: MailJob; attempt: number }> = [];
  private draining = false;
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly schedule: (fn: () => void, delayMs: number) => void;
  private readonly logger: Pick<Console, "info" | "error">;

  constructor(options: MailQueueOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 2000;
    this.schedule = options.schedule ?? ((fn, ms) => setTimeout(fn, ms).unref());
    this.logger = options.logger ?? console;
  }

  get size(): number {
    return this.pending.length;
  }

  enqueue(job: MailJob): void {
    this.pending.push({ job, attempt: 1 });
    this.schedule(() => void this.drain(), 0);
  }

  /** Procesa la cola de uno en uno para no saturar al proveedor SMTP. */
  async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      let next = this.pending.shift();
      while (next) {
        await this.run(next.job, next.attempt);
        next = this.pending.shift();
      }
    } finally {
      this.draining = false;
    }
  }

  private async run(job: MailJob, attempt: number): Promise<void> {
    try {
      await job.send();
      this.logger.info(`[MailQueue] Enviado: ${job.description}`);
    } catch (err) {
      if (attempt >= this.maxAttempts) {
        this.logger.error(`[MailQueue] Descartado tras ${attempt} intentos: ${job.description}`, err);
        return;
      }
      const delay = this.baseDelayMs * 2 ** (attempt - 1);
      this.schedule(() => {
        this.pending.push({ job, attempt: attempt + 1 });
        void this.drain();
      }, delay);
    }
  }
}
