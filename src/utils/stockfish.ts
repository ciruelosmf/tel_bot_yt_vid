// utils/stockfish.ts
export class StockfishEngine {
    private engine: Worker;
  
    constructor() {
      this.engine = new Worker('/stockfish.js');
    }
  
    send(command: string) {
      this.engine.postMessage(command);
    }
  
    onMessage(callback: (message: string) => void) {
      this.engine.onmessage = (event) => {
        if (typeof event.data === 'string') {
          callback(event.data);
        }
      };
    }
  
    // Additional methods as needed
  }