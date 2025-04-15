import React from 'react';
import { Typography, TextField, Button, IconButton, Box } from '@mui/material';
import { Flex } from '@mantine/core';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { StreamData } from '../types';
import { StreamerItem } from './StreamerItem';

interface SidebarProps {
  streamers: StreamData[];
  offlines: string[];
  error: string | null;
  channelAvatars: Record<string, string>;
  sidebarCollapsed: boolean;
  showAddChannel: boolean;
  newChannel: string;
  onNewChannelChange: (value: string) => void;
  onAddChannel: () => void;
  onToggleSidebar: () => void;
  onAddButtonClick: () => void;
  onLiveClick: (channel: string, title: string) => void;
  onOfflineClick: (channel: string) => void;
  onRemoveChannel: (channel: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  streamers,
  offlines,
  error,
  channelAvatars,
  sidebarCollapsed,
  showAddChannel,
  newChannel,
  onNewChannelChange,
  onAddChannel,
  onToggleSidebar,
  onAddButtonClick,
  onLiveClick,
  onOfflineClick,
  onRemoveChannel
}) => {
  const getAvatarUrl = (name: string) => {
    const lowerName = name.toLowerCase();
    return channelAvatars[lowerName] || 
      `https://static-cdn.jtvnw.net/user-default-pictures-uv/13e5fa74-defa-11e9-809c-784f43822e80-profile_image-70x70.png`;
  };

  return (
    <Flex className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!sidebarCollapsed && (
          <Typography variant="h5">GraviTV</Typography>
        )}
        <IconButton 
          className="collapse-sidebar-btn" 
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </div>
      
      <div className="channels-container">
        {error && (
          <Box className="error-message">
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        <>
          {streamers && streamers.map((s) => (
            <StreamerItem
              key={`live-${s.user_name}`}
              name={s.user_name}
              isLive={true}
              viewerCount={s.viewer_count}
              sidebarCollapsed={sidebarCollapsed}
              avatarUrl={getAvatarUrl(s.user_name)}
              onClick={() => onLiveClick(s.user_name, s.title)}
              onRemove={onRemoveChannel}
            />
          ))}
          {offlines && offlines.map((name) => (
            <StreamerItem
              key={`offline-${name}`}
              name={name}
              isLive={false}
              viewerCount={0}
              sidebarCollapsed={sidebarCollapsed}
              avatarUrl={getAvatarUrl(name)}
              onClick={() => onOfflineClick(name)}
              onRemove={onRemoveChannel}
            />
          ))}
          {(!streamers || streamers.length === 0) && (!offlines || offlines.length === 0) && (
            <Box className="no-channels-message">
              <Typography>No channels available. Try adding some!</Typography>
            </Box>
          )}
        </>
      </div>
      
      <div className="sidebar-actions">
        <IconButton 
          className="add-channel-btn" 
          onClick={onAddButtonClick}
        >
          <AddIcon />
        </IconButton>
        
        {showAddChannel && !sidebarCollapsed && (
          <div className="add-channel-form">
            <TextField
              size="small"
              placeholder="Channel name"
              value={newChannel}
              onChange={(e) => onNewChannelChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddChannel()}
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  color: 'var(--text-color)',
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--orange-accent)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(var(--orange-accent-rgb), 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(var(--orange-accent-rgb), 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--orange-accent)',
                  }
                }
              }}
            />
            <Button 
              variant="contained" 
              size="small" 
              onClick={onAddChannel}
              sx={{
                backgroundColor: 'var(--orange-accent)',
                color: '#0a0a0a',
                '&:hover': {
                  backgroundColor: '#e57c00',
                }
              }}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    </Flex>
  );
}; 