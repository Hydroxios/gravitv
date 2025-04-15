import { useState, useEffect, useCallback } from 'react';

export const useSidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showAddChannel, setShowAddChannel] = useState<boolean>(false);

  const handleAddButtonClick = useCallback(() => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      // Set a small timeout to wait for the sidebar animation to complete
      setTimeout(() => setShowAddChannel(true), 300);
    } else {
      setShowAddChannel(!showAddChannel);
    }
  }, [sidebarCollapsed, showAddChannel]);

  // Effect to close the add channel form when sidebar is collapsed
  useEffect(() => {
    if (sidebarCollapsed && showAddChannel) {
      setShowAddChannel(false);
    }
  }, [sidebarCollapsed, showAddChannel]);

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    showAddChannel,
    setShowAddChannel,
    handleAddButtonClick
  };
}; 