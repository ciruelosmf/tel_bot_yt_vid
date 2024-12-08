declare namespace Telegram {
    interface WebAppUser {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    }
  
    interface WebAppInitDataUnsafe {
      query_id?: string;
      user?: WebAppUser;
      auth_date: number;
      hash: string;
    }
  
    interface WebApp {
      initDataUnsafe: WebAppInitDataUnsafe;
      expand: () => void;
    }
  }
  
  interface Window {
    Telegram: {
      WebApp: Telegram.WebApp;
    };
  }
  