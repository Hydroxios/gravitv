import React, { useState } from 'react';
import { Typography, Avatar, Box, Tooltip, Menu, MenuItem } from '@mui/material';
import AdjustRoundedIcon from '@mui/icons-material/AdjustRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { notifications } from '@mantine/notifications';

interface StreamerItemProps {
  name: string;
  isLive: boolean;
  viewerCount: number;
  sidebarCollapsed: boolean;
  avatarUrl: string;
  onClick: () => void;
  onRemove: (name: string) => void;
}

export const StreamerItem: React.FC<StreamerItemProps> = ({
  name,
  isLive,
  viewerCount,
  sidebarCollapsed,
  avatarUrl,
  onClick,
  onRemove
}) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove(name);
    handleClose();
  };

  const handleCopyUrl = (event: React.MouseEvent) => {
    event.stopPropagation();
    const url = `${window.location.origin}/${name}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        notifications.show({
          title: 'URL Copied',
          message: `Channel URL for ${name} copied to clipboard`,
          color: 'green',
          autoClose: 3000,
        });
        console.log('URL copied to clipboard');
      })
      .catch(err => {
        notifications.show({
          title: 'Error',
          message: 'Could not copy URL to clipboard',
          color: 'red',
          autoClose: 3000,
        });
        console.error('Could not copy URL: ', err);
      });
    handleClose();
  };

  return (
    <Box 
      onClick={onClick} 
      onContextMenu={handleContextMenu}
      className={`channel-item ${isLive ? 'live' : 'offline'}`}
    >
      {sidebarCollapsed ? (
        // When collapsed, show avatar with status indicator
        <Box sx={{ position: 'relative', width: '36px', height: '36px', margin: '0 auto' }}>
          <Tooltip 
            title={isLive ? `${name} - ${viewerCount} viewers` : name} 
            arrow 
            placement="right"
          >
            <Avatar
              src={avatarUrl}
              alt={name}
              className="channel-avatar"
              sx={{ 
                width: 36, 
                height: 36,
                opacity: isLive ? 1 : 0.6,
              }}
            />
          </Tooltip>
          {isLive && (
            <Box
              className="live-indicator"
            />
          )}
        </Box>
      ) : (
        // When expanded, show the full channel item
        <>
          <Typography variant="h6" className="channel-name">
            <AdjustRoundedIcon className={isLive ? 'live-icon' : 'offline-icon'} />
            <Tooltip 
              title={isLive ? `${viewerCount} viewers watching ${name}` : `${name} is offline`} 
              arrow 
              placement="top"
            >
              <span className="channel-text">
                {isLive ? `${viewerCount} | ${name}` : name}
              </span>
            </Tooltip>
          </Typography>
        </>
      )}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'var(--sidebar-background)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--sidebar-border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            minWidth: '200px',
            overflow: 'hidden'
          }
        }}
      >
        <MenuItem 
          onClick={handleCopyUrl}
          disableRipple
          sx={{
            padding: '12px 16px',
            color: 'var(--text-color)',
            '&:hover': {
              backgroundColor: 'var(--channel-item-hover-background)',
            },
            '& .MuiSvgIcon-root': {
              color: 'var(--orange-accent)'
            }
          }}
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Copy channel URL
        </MenuItem>
        <MenuItem 
          onClick={handleDelete}
          disableRipple
          sx={{
            padding: '12px 16px',
            color: 'var(--text-color)',
            '&:hover': {
              backgroundColor: 'var(--channel-item-hover-background)',
            },
            '& .MuiSvgIcon-root': {
              color: 'var(--orange-accent)'
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove channel
        </MenuItem>
      </Menu>
    </Box>
  );
}; 