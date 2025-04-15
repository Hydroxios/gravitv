import './App.css';
import { Flex } from '@mantine/core';
import { useStreamers } from './hooks/useStreamers';
import { useSidebar } from './hooks/useSidebar';
import { Sidebar } from './components/Sidebar';
import { TwitchStreamPlayer } from './components/TwitchStreamPlayer';
import { ThemeToggle } from './components/ThemeToggle';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

interface AppProps {
  colorScheme: 'dark' | 'light';
  toggleColorScheme: (value?: 'dark' | 'light') => void;
}

function AppContent({ colorScheme, toggleColorScheme }: AppProps) {
  const {
    newChannel,
    setNewChannel,
    streamers,
    offlines,
    channel,
    title,
    error,
    channelAvatars,
    handleLiveClick,
    handleOfflineClick,
    handleAddChannel,
    handleRemoveChannel,
    streamerList
  } = useStreamers();

  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    showAddChannel,
    handleAddButtonClick
  } = useSidebar();

  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      const channelName = username.toLowerCase();
      if (!streamerList.includes(channelName)) {
        setNewChannel(channelName);
        handleAddChannel();
      }
      handleLiveClick(channelName, '');
    }
  }, [username, streamerList, setNewChannel, handleAddChannel, handleLiveClick]);

  return (
    <div className="App">
      <Flex className="main-container">
        <Sidebar
          streamers={streamers}
          offlines={offlines}
          error={error}
          channelAvatars={channelAvatars}
          sidebarCollapsed={sidebarCollapsed}
          showAddChannel={showAddChannel}
          newChannel={newChannel}
          onNewChannelChange={setNewChannel}
          onAddChannel={handleAddChannel}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onAddButtonClick={handleAddButtonClick}
          onLiveClick={(channel, title) => {
            handleLiveClick(channel, title);
            navigate(`/${channel}`);
          }}
          onOfflineClick={(channel) => {
            handleOfflineClick(channel);
            navigate(`/${channel}`);
          }}
          onRemoveChannel={handleRemoveChannel}
        />
        <div className={`content ${sidebarCollapsed ? 'expanded' : ''}`}>
          <TwitchStreamPlayer 
            channel={channel} 
            title={title} 
            colorScheme={colorScheme}
          />
        </div>
      </Flex>
      <ThemeToggle colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
    </div>
  );
}

function App({ colorScheme, toggleColorScheme }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:username?" element={<AppContent colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;