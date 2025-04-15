declare module 'tmi.js' {
  export interface ChatUserstate {
    'display-name'?: string;
    username?: string;
    id?: string;
    [key: string]: any;
  }

  export interface ClientOptions {
    channels?: string[];
    connection?: {
      reconnect?: boolean;
      secure?: boolean;
    };
    identity?: {
      username?: string;
      password?: string;
    };
    options?: {
      debug?: boolean;
    };
  }

  export class Client {
    constructor(opts?: ClientOptions);
    connect(): Promise<[string, number]>;
    disconnect(): Promise<[string, number]>;
    on(event: 'message', listener: (channel: string, userstate: ChatUserstate, message: string, self: boolean) => void): this;
    on(event: string, listener: Function): this;
    removeAllListeners(event?: string): this;
  }
} 