import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'orange',
  components: {
    Notification: {
      styles: {
        root: {
          backgroundColor: 'var(--background-color)',
          border: '1px solid var(--sidebar-border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        },
        title: {
          color: 'var(--orange-accent)',
          fontWeight: 600,
        },
        description: {
          color: 'var(--text-color)',
        },
        closeButton: {
          color: 'var(--text-color)',
          '&:hover': {
            backgroundColor: 'rgba(var(--orange-accent-rgb), 0.1)',
          },
        },
      },
    },
  },
});

const MantineWrapper = () => {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'gravitv-color-scheme',
    defaultValue: 'dark',
  });

  const toggleColorScheme = (value) => 
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <MantineProvider 
      theme={theme}
      defaultColorScheme={colorScheme}
      forceColorScheme={colorScheme}
    >
      <Notifications position="top-right" zIndex={2000} />
      <App colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
    </MantineProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MantineWrapper />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
