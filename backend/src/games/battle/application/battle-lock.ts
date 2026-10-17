/**
 * Una batalla se lee, cambia y guarda en Redis. Dos disparos que llegan a la
 * vez pisarian el estado del otro, asi que cada sala procesa sus eventos en fila.
 * (El backend corre en una sola instancia; con varias haria falta un candado en Redis.)
 */
export class BattleLock {
  private readonly tails = new Map<string, Promise<unknown>>();

  run<T>(code: string, task: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(code) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(task);
    const tail = next.catch(() => undefined);
    this.tails.set(code, tail);
    void tail.then(() => {
      if (this.tails.get(code) === tail) this.tails.delete(code);
    });
    return next;
  }
}
