import { useState, useEffect, useCallback } from 'react';
import { StreamData } from '../types';

const LOCAL_STORAGE_KEY = 'gravitv_channels';
const AVATARS_STORAGE_KEY = 'gravitv_avatars';

export const useStreamers = () => {
  // Get default channels from localStorage or use the initial list
  const getInitialChannels = (): string[] => {
    const savedChannels = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedChannels) {
      return JSON.parse(savedChannels);
    }
    return [];
  };
  
  // Get saved avatars from localStorage if available
  const getInitialAvatars = (): Record<string, string> => {
    const savedAvatars = localStorage.getItem(AVATARS_STORAGE_KEY);
    if (savedAvatars) {
      return JSON.parse(savedAvatars);
    }
    return {};
  };
  
  const [streamerList, setStreamerList] = useState<string[]>(getInitialChannels().sort());
  const [newChannel, setNewChannel] = useState<string>("");
  const [streamers, setStreamers] = useState<StreamData[]>([]);
  const [offlines, setOfflines] = useState<string[]>([]);
  const [channel, setChannel] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [channelAvatars, setChannelAvatars] = useState<Record<string, string>>(getInitialAvatars());

  // Save channels to localStorage whenever streamerList changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(streamerList));
  }, [streamerList]);
  
  // Save avatars to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(AVATARS_STORAGE_KEY, JSON.stringify(channelAvatars));
  }, [channelAvatars]);

  // Function to fetch Twitch avatars
  const fetchAvatars = useCallback(async (channelNames: string[]) => {
    try {
      // Only fetch for channels we don't already have avatars for
      const channelsToFetch = channelNames.filter(name => !channelAvatars[name.toLowerCase()]);
      
      if (channelsToFetch.length === 0) return;
      
      // Create a copy of the current avatars
      const newAvatars = { ...channelAvatars };
      let avatarsUpdated = false;
      
      // Fetch one by one to avoid rate limiting
      for (const channelName of channelsToFetch) {
        try {
          // Use the decapi.me service which provides Twitch avatars
          const apiUrl = `https://decapi.me/twitch/avatar/${channelName}`;
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const avatarUrl = await response.text();
            
            // Only save valid URLs (the API returns an error message if channel not found)
            if (avatarUrl && !avatarUrl.includes('Error')) {
              newAvatars[channelName.toLowerCase()] = avatarUrl;
              avatarsUpdated = true;
            }
          }
        } catch (error) {
          console.error(`Error fetching avatar for ${channelName}:`, error);
          // Continue with next channel even if one fails
        }
      }
      
      // Only update state if we got new avatars
      if (avatarsUpdated) {
        setChannelAvatars(newAvatars);
      }
    } catch (error) {
      console.error('Error in avatar fetch operation:', error);
    }
  }, [channelAvatars]);

  // Fetch avatars on initial load
  useEffect(() => {
    fetchAvatars(streamerList);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Fetch avatars when streamer list changes
  useEffect(() => {
    if (streamerList.length > 0) {
      fetchAvatars(streamerList);
    }
  }, [streamerList, fetchAvatars]);

  // Function to fetch a single avatar
  const fetchSingleAvatar = useCallback(async (channelName: string) => {
    try {
      const apiUrl = `https://decapi.me/twitch/avatar/${channelName}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const avatarUrl = await response.text();
        
        if (avatarUrl && !avatarUrl.includes('Error')) {
          setChannelAvatars(prev => ({
            ...prev,
            [channelName.toLowerCase()]: avatarUrl
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching avatar for ${channelName}:`, error);
    }
  }, []);

  const fetchStreams = useCallback(async () => {
    try {
      setError(null);
      const url = `http://62.4.23.107/api/twitch/stream.php?names=${streamerList.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result || !result.data) {
        setStreamers([]);
        setOfflines(streamerList);
        return;
      }
      
      setStreamers(result.data || []);
      
      // Calculate which streamers are offline
      const offlineStreamers = streamerList.filter(name => 
        !result.data || !result.data.some((stream: StreamData) => stream.user_name.toLowerCase() === name.toLowerCase())
      );
      setOfflines(offlineStreamers);
      
      // If any streams are online, set one as active ONLY if no channel is selected
      if (result.data && result.data.length > 0) {
        if (!channel) {
          // No channel selected, select first online stream
          const firstOnlineStream = result.data[0];
          setChannel(firstOnlineStream.user_name);
          setTitle(firstOnlineStream.title);
          document.title = `GraviTV - ${firstOnlineStream.user_name}`;
        } else {
          // Update title if current channel is online
          const currentStream = result.data.find((s: StreamData) => s.user_name.toLowerCase() === channel.toLowerCase());
          if (currentStream) {
            setTitle(currentStream.title);
          } else if (offlineStreamers.includes(channel)) {
            // Clear title if current channel is offline
            setTitle("");
          }
        }
      } else if (offlineStreamers.includes(channel)) {
        // All channels offline including current one, clear title
        setTitle("");
      }
      
    } catch (error) {
      console.error("Error fetching streams:", error);
      setStreamers([]);
      setOfflines(streamerList);
      setError("Failed to fetch stream data. Please try again later.");
    }
  }, [streamerList, channel]);

  const handleLiveClick = useCallback((newChannel: string, newTitle: string) => {
    setChannel(newChannel);
    setTitle(newTitle);
    document.title = `GraviTV - ${newChannel}`;
  }, []);

  const handleOfflineClick = useCallback((name: string) => {
    setChannel(name);
    setTitle(""); // Clear title when selecting offline channel
    document.title = `GraviTV - ${name} (Offline)`;
  }, []);

  const handleAddChannel = useCallback(() => {
    if (newChannel && !streamerList.includes(newChannel)) {
      const updatedList = [...streamerList, newChannel].sort();
      setStreamerList(updatedList);
      setNewChannel("");

      // Fetch avatar for the new channel
      fetchSingleAvatar(newChannel);
      
      // Try to quickly check if the added channel is online
      // and if so, make it the active channel
      async function checkAndSetNewChannel() {
        try {
          const url = `http://62.4.23.107/api/twitch/stream.php?names=${newChannel}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const result = await response.json();
            if (result && result.data && result.data.length > 0) {
              // The new channel is online, set it as active
              setChannel(newChannel);
              setTitle(result.data[0].title);
              document.title = `GraviTV - ${newChannel}`;
            }
          }
        } catch (error) {
          console.error("Error checking new channel status:", error);
        }
        
        // Refresh stream data after checking
        fetchStreams();
      }
      
      checkAndSetNewChannel();
    }
  }, [newChannel, streamerList, fetchSingleAvatar, fetchStreams]);

  const handleRemoveChannel = useCallback((channelToRemove: string) => {
    if (streamerList.length > 1) {
      const updatedList = streamerList.filter(name => name !== channelToRemove);
      setStreamerList(updatedList);
      
      // Remove the avatar when removing a channel
      setChannelAvatars(prev => {
        const newAvatars = { ...prev };
        delete newAvatars[channelToRemove.toLowerCase()];
        return newAvatars;
      });
      
      // If the current channel is being removed, select another one
      if (channel === channelToRemove) {
        const newSelectedChannel = updatedList[0];
        setChannel(newSelectedChannel);
        
        // Clear the title initially to avoid showing old title
        setTitle("");
        
        // Let the fetchStreams function update the title if the new channel is live
        fetchStreams();
      } else {
        // Just refresh stream data after removing a channel
        fetchStreams();
      }
    }
  }, [streamerList, channel, fetchStreams]);

  // Set up polling for stream data
  useEffect(() => {
    fetchStreams();

    const interval = setInterval(() => {
      const currentTime = Date.now();
      console.log(`Updated after: ${(currentTime - lastUpdate) / 1000}s`);
      setLastUpdate(currentTime);
      fetchStreams();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [lastUpdate, fetchStreams]);

  return {
    streamerList,
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
    fetchStreams
  };
}; 