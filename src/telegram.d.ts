interface WebApp {
    ready(): void;
    initDataUnsafe: {
      user?: {
        first_name?: string;
        username?: string;
        id: number;
      };
    };
  }
  
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }