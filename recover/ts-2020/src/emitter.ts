export class Emitter {
  private readonly listeners = new Map<string, Listener[]>();

  on(signal: string, listener: Listener) {
    if (!this.listeners.has(signal)) {
      this.listeners.set(signal, []);
    }

    this.listeners.get(signal).push(listener);
  }

  emit(signal: string, argument: any) {
    const listeners = this.listeners.get(signal);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(argument);
    }
  }
}

export type Listener = (event: any) => void;
