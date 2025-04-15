import React from 'react';
import { Box, Typography } from '@mui/material';
import { TwitchPlayer } from 'react-twitch-embed';
import CustomChat from './CustomChat';

interface TwitchStreamPlayerProps {
  channel: string;
  title: string;
  colorScheme: 'dark' | 'light';
}

export const TwitchStreamPlayer: React.FC<TwitchStreamPlayerProps> = ({ channel, title, colorScheme }) => {
  return (
    <>
      {title ? (
        <div className="stream-title">{title}</div>
      ) : channel ? (
        <div className="stream-title offline">Channel offline - no stream title available</div>
      ) : null}
      <div className="player-wrapper">
        <div className="player-container">
          {channel ? (
            <TwitchPlayer channel={channel} height="720px" width="1280px" />
          ) : (
            <Box className="no-channel-selected" sx={{ height: "720px", width: "1280px", display: "flex", justifyContent: "center", alignItems: "center", background: "#1a1a1a" }}>
              <Typography>No channel selected</Typography>
            </Box>
          )}
        </div>
        {channel && (
          <div className="chat-container">
            <CustomChat 
              channel={channel} 
              height={720} 
              width={350} 
              darkMode={colorScheme === 'dark'} 
            />
          </div>
        )}
      </div>
    </>
  );
}; 