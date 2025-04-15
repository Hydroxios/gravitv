/// <reference types="react-scripts" />

// Include twitch embed typings
declare module 'react-twitch-embed' {
  export interface TwitchPlayerProps {
    channel: string;
    width?: string | number;
    height?: string | number;
    [key: string]: any;
  }

  export interface TwitchChatProps {
    channel: string;
    width?: string | number;
    height?: string | number;
    darkMode?: boolean;
    [key: string]: any;
  }

  export const TwitchPlayer: React.FC<TwitchPlayerProps>;
  export const TwitchChat: React.FC<TwitchChatProps>;
} 