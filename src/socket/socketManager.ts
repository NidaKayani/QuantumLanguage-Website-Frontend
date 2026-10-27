import { env } from '../config/env';

interface ExecutionRequest {
  code: string;
  ext: string;
  name?: string;
}

/** How a run ended, as reported by the backend. */
export interface ProcessExit {
  exitCode: number | null;
  /** Where it failed: "compile" (never ran), "runtime", or null on success. */
  stage: 'compile' | 'runtime' | null;
  /** The user stopped it. */
  stopped?: boolean;
  /** The connection to the server was lost or never made. */
  disconnected?: boolean;
}

const isDebugMode = env.IS_DEBUG;

export class QuantumSocketManager {
  private socket: WebSocket | null = null;
  public onOutputReceived: ((text: string) => void) | null = null;
  public onStatusChange: ((status: string) => void) | null = null;
  public onProcessExit: ((exit: ProcessExit) => void) | null = null;
  private isConnected: boolean = false;
  private isRunning: boolean = false;
  private pendingExecution: ExecutionRequest | null = null;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    const socket = new WebSocket(env.WS_URL);
    this.socket = socket;

    socket.onopen = () => {
      this.isConnected = true;

      if (this.onStatusChange) this.onStatusChange("connected");
      if (isDebugMode && this.onOutputReceived) {
        this.onOutputReceived("\x1b[32m🟢 Connected to Quantum Server\x1b[0m\r\n");
      }

      // Process any pending execution request
      if (this.pendingExecution) {
        const { code, ext, name } = this.pendingExecution;
        socket.send(JSON.stringify({ type: "run", payload: code, ext, name }));
        this.pendingExecution = null;
      }
    };

    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.isConnected = false;
      this.socket = null;
      if (this.onStatusChange) this.onStatusChange("disconnected");
      if (isDebugMode && this.onOutputReceived) {
        this.onOutputReceived("\x1b[31m🔴 Connection closed by server\x1b[0m\r\n");
      }
      // A run in flight (or waiting to connect) can no longer finish.
      if (this.isRunning) {
        this.isRunning = false;
        this.pendingExecution = null;
        this.onProcessExit?.({ exitCode: null, stage: null, disconnected: true });
      }
    };

    socket.onerror = () => {
      // onclose always follows and does the cleanup.
      if (this.onStatusChange) this.onStatusChange("error");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "stdout":
          if (this.onOutputReceived) this.onOutputReceived(data.payload);
          break;
        case "stderr":
          if (this.onOutputReceived) this.onOutputReceived(`\x1b[31m${data.payload}\x1b[0m`);
          break;
        case "status":
          // Only show status messages in debug mode
          if (isDebugMode && this.onOutputReceived) {
            this.onOutputReceived(`\x1b[33m[Status]: ${data.payload}\x1b[0m\r\n`);
          }
          break;
        case "process_completion":
          this.isRunning = false;
          this.onProcessExit?.({
            exitCode: data.exitCode ?? null,
            stage: data.stage ?? null,
            stopped: Boolean(data.stopped),
          });
          break;
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /** `name` is the file's name in the IDE, used in compiler messages. */
  runScript(code: string, ext: string = '.sa', name?: string) {
    this.isRunning = true;

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "run", payload: code, ext, name }));
      return;
    }

    // Not connected yet: run as soon as the connection opens.
    this.pendingExecution = { code, ext, name };
    this.connect();
  }

  sendInput(userInput: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "input", payload: userInput }));
    }
  }

  stopScript() {
    if (this.pendingExecution) {
      this.pendingExecution = null;
      this.isRunning = false;
      this.onProcessExit?.({ exitCode: null, stage: null, stopped: true });
      return;
    }
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "stop" }));
    }
  }

  getIsConnected() {
    return this.isConnected;
  }

  getIsRunning() {
    return this.isRunning;
  }

  getReadyState() {
    return this.socket?.readyState;
  }
}

export const socketManager = new QuantumSocketManager();
