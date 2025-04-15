import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Link, Switch, FormControlLabel } from '@mui/material';
import { Flex } from '@mantine/core';
import tmi from 'tmi.js';
import { TwitchChat } from 'react-twitch-embed';

// Add Twitch SVG icon
const TwitchIcon = () => (
  <Box component="span" sx={{ 
    display: 'inline-flex', 
    alignItems: 'center',
    marginRight: '4px',
    height: '14px',
    width: '14px'
  }}>
    <svg viewBox="0 0 24 24" height="100%" width="100%" fill="#9147ff">
      <path d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z" />
    </svg>
  </Box>
);

interface CustomMessage {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isCustom: boolean;
}

interface CustomChatProps {
  channel: string;
  height?: number;
  width?: number;
  darkMode?: boolean;
}

// Update the parseMessageWithLinks function
const parseMessageWithLinks = (content: string, darkMode: boolean) => {
  // URL regex pattern that matches http, https, and www. links
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  
  if (!content.match(urlRegex)) {
    return <span>{content}</span>;
  }
  
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  // Reset the regex to start from the beginning
  urlRegex.lastIndex = 0;
  
  // Find all matches and build the elements array
  while ((match = urlRegex.exec(content)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
    }
    
    // Get the matched URL
    const url = match[0];
    let href = url;
    
    // If the URL starts with 'www.', prefix it with 'https://'
    if (url.startsWith('www.')) {
      href = 'https://' + url;
    }
    
    // Add the link element without confirmation
    elements.push(
      <Link
        key={`link-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-link"
      >
        {url}
      </Link>
    );
    
    lastIndex = match.index + url.length;
  }
  
  // Add any remaining text after the last match
  if (lastIndex < content.length) {
    elements.push(<span key={`text-end`}>{content.substring(lastIndex)}</span>);
  }
  
  return <>{elements}</>;
};

const CustomChat: React.FC<CustomChatProps> = ({ 
  channel, 
  height = 500, 
  width = 350, 
  darkMode = true 
}) => {
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState(() => {
    const savedUsername = localStorage.getItem('gravitv_username');
    return savedUsername || `User${Math.floor(Math.random() * 10000)}`;
  });
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [showTwitchEmbed, setShowTwitchEmbed] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const twitchClient = useRef<tmi.Client | null>(null);
  const currentChannel = useRef<string>(channel);
  
  // Used to prevent duplicate messages
  const processedMessages = useRef<Set<string>>(new Set());

  // Handle Twitch chat connection
  useEffect(() => {
    if (!channel) return;
    
    // Clear messages when channel changes
    if (currentChannel.current !== channel) {
      setMessages([]);
      processedMessages.current.clear();
      currentChannel.current = channel;
    }

    // Disconnect previous client if exists
    if (twitchClient.current) {
      try {
        twitchClient.current.removeAllListeners('message');
        twitchClient.current.disconnect();
        console.log(`Disconnected from previous channel: ${currentChannel.current}`);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      twitchClient.current = null;
    }

    // Create new client
    const client = new tmi.Client({
      channels: [channel],
      connection: {
        reconnect: true,
        secure: true
      }
    });

    // Set up message handler
    const handleMessage = (channelName: string, tags: tmi.ChatUserstate, message: string, self: boolean) => {
      const messageId = tags.id || `${Date.now()}-${Math.random()}`;
      
      // Skip if we've already processed this message
      if (processedMessages.current.has(messageId)) {
        return;
      }
      
      // Add to processed set
      processedMessages.current.add(messageId);
      
      // Keep set from growing too large
      if (processedMessages.current.size > 200) {
        const toRemove = Array.from(processedMessages.current).slice(0, 100);
        toRemove.forEach(id => processedMessages.current.delete(id));
      }
      
      const twitchMessage: CustomMessage = {
        id: `twitch-${messageId}`,
        username: tags['display-name'] || tags.username || 'Anonymous',
        content: message,
        timestamp: new Date(),
        isCustom: false
      };
      
      setMessages(prevMessages => [...prevMessages, twitchMessage]);
    };

    // Connect and set event listeners
    client.connect()
      .then(() => {
        console.log(`Connected to ${channel} chat`);
        client.on('message', handleMessage);
        twitchClient.current = client;
      })
      .catch(err => {
        console.error('Failed to connect to Twitch chat:', err);
      });

    // Cleanup on unmount or channel change
    return () => {
      if (client) {
        try {
          client.removeAllListeners('message');
          client.disconnect();
          console.log(`Cleanup: Disconnected from ${channel} chat`);
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, [channel]);

  useEffect(() => {
    localStorage.setItem('gravitv_username', username);
  }, [username]);

  // Adjust auto-scroll behavior to be smoother
  useEffect(() => {
    if (messagesEndRef.current) {
      // Check if user is already at the bottom before autoscrolling
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < (height / 2);
        
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, height]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageId = `custom-${Date.now()}`;
      const message: CustomMessage = {
        id: messageId,
        username,
        content: newMessage,
        timestamp: new Date(),
        isCustom: true
      };
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  const handleUsernameChange = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername);
      setShowUsernameEdit(false);
    }
  };

  const toggleChatType = () => {
    setShowTwitchEmbed(prev => !prev);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: height, 
      width, 
      backgroundColor: darkMode ? '#18181b' : '#f7f7f8',
      color: darkMode ? '#efeff1' : '#0e0e10',
      borderRadius: '4px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        padding: '8px 12px', 
        borderBottom: `1px solid var(--sidebar-border)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: darkMode ? 'rgba(15, 15, 20, 0.9)' : 'rgba(240, 240, 245, 0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(5px)'
      }}>
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ color: 'var(--orange-accent)' }}>Chat: {channel}</Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={showTwitchEmbed}
                onChange={toggleChatType}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#9147ff',
                    '&:hover': {
                      backgroundColor: 'rgba(145, 71, 255, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#9147ff',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: darkMode ? '#555' : '#ccc',
                  },
                }}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: showTwitchEmbed ? '#9147ff' : 'var(--orange-accent)' }}>
                {showTwitchEmbed ? "Twitch Chat" : "Custom Chat"}
              </Typography>
            }
            labelPlacement="start"
          />
          
          {!showTwitchEmbed && (
            showUsernameEdit ? (
              <Flex gap={1}>
                <TextField
                  size="small"
                  variant="outlined"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 138, 0, 0.5)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 138, 0, 0.8)' },
                      fontSize: '0.8rem',
                      height: '28px'
                    },
                    width: '120px'
                  }}
                  autoComplete='off'
                />
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={handleUsernameChange}
                  sx={{ 
                    height: '28px', 
                    fontSize: '0.7rem',
                    backgroundColor: '#ff8a00',
                    color: '#0a0a0a',
                    '&:hover': {
                      backgroundColor: '#e57c00'
                    }
                  }}
                >
                  Save
                </Button>
              </Flex>
            ) : (
              <Box 
                className="username-badge"
                onClick={() => setShowUsernameEdit(true)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '100px',
                  textAlign: 'center',
                  margin: '2px'
                }}
              >
                {username}
              </Box>
            )
          )}
        </Flex>
      </Box>
      
      {showTwitchEmbed ? (
        <Box sx={{ flexGrow: 1, height: 'calc(100% - 40px)' }}>
          <TwitchChat channel={channel} darkMode={darkMode} height="100%" width="100%" />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1,
          overflow: 'hidden'
        }}>
          <Box 
            className="custom-chat-messages"
            sx={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              backgroundColor: darkMode ? 'rgba(24, 24, 27, 0.95)' : 'rgba(240, 240, 245, 0.95)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: darkMode ?
                  'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: darkMode ?
                  'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            {messages.length > 0 ? (
              messages.map(msg => (
                <Box 
                  key={msg.id}
                  sx={{ 
                    marginBottom: '8px',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: msg.isCustom ? 
                      (darkMode ? 'rgba(var(--orange-accent-rgb), 0.1)' : 'rgba(var(--orange-accent-rgb), 0.05)') : 
                      'transparent',
                    borderLeft: msg.isCustom ? 
                      '3px solid var(--orange-accent)' :
                      '3px solid #9147ff'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'baseline',
                      marginBottom: '2px'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: msg.isCustom ? 'var(--orange-accent)' : '#9147ff', 
                        marginRight: '8px' 
                      }}
                    >
                      {msg.isCustom ? (
                        <span onClick={() => setShowUsernameEdit(true)} style={{ cursor: 'pointer' }}>
                          {msg.username}
                        </span>
                      ) : (
                        <Flex align="center">
                          <TwitchIcon />
                          {msg.username}
                        </Flex>
                      )}
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', fontSize: '0.65rem' }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: darkMode ? '#efeff1' : '#0e0e10' }}>
                    {parseMessageWithLinks(msg.content, darkMode)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                <Typography variant="body2">
                  Connecting to chat... Messages will appear here.
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          <Box 
            className="message-input-container"
            sx={{
              padding: '12px', 
              borderTop: `1px solid var(--sidebar-border)`,
              backgroundColor: darkMode ? 'rgba(15, 15, 20, 0.9)' : 'rgba(240, 240, 245, 0.9)',
              position: 'relative'
            }}
          >
            {showUsernameEdit && (
              <Box sx={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                backgroundColor: darkMode ? 'rgba(15, 15, 20, 0.95)' : 'rgba(240, 240, 245, 0.95)',
                padding: '12px',
                borderTop: `1px solid var(--sidebar-border)`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Change Username"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-input': {
                      color: darkMode ? '#fff' : '#000',
                    },
                    '& .MuiInputLabel-root': {
                      color: `var(--orange-accent)`,
                    },
                    '& fieldset': { borderColor: 'rgba(var(--orange-accent-rgb), 0.5)' },
                    '&:hover fieldset': { borderColor: 'rgba(var(--orange-accent-rgb), 0.8)' },
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleUsernameChange()}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUsernameChange}
                  sx={{
                    backgroundColor: 'var(--orange-accent)',
                    '&:hover': {
                      backgroundColor: darkMode ? '#d97000' : '#e06000',
                    },
                    minWidth: '80px'
                  }}
                >
                  Save
                </Button>
              </Box>
            )}
            
            <TextField
              fullWidth
              size="small"
              placeholder="Send a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  color: darkMode ? '#fff' : '#000',
                },
                '& fieldset': { borderColor: 'rgba(var(--orange-accent-rgb), 0.5)' },
                '&:hover fieldset': { borderColor: 'rgba(var(--orange-accent-rgb), 0.8)' },
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              className="send-button"
              onClick={handleSendMessage}
              sx={{
                backgroundColor: 'var(--orange-accent)',
                marginLeft: '8px',
                '&:hover': {
                  backgroundColor: darkMode ? '#d97000' : '#e06000',
                }
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomChat; 