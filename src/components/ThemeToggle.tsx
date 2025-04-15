import { ActionIcon } from '@mantine/core';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

interface ThemeToggleProps {
  colorScheme: 'dark' | 'light';
  toggleColorScheme: (value?: 'dark' | 'light') => void;
}

export const ThemeToggle = ({ colorScheme, toggleColorScheme }: ThemeToggleProps) => {
  const dark = colorScheme === 'dark';

  return (
    <ActionIcon
      variant="outline"
      color={dark ? 'orange' : 'orange'}
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
      pos="fixed"
      bottom={20}
      right={20}
      radius="xl"
      size="lg"
      sx={{
        background: dark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(5px)',
        border: dark ? `1px solid var(--sidebar-border)` : `1px solid rgba(var(--orange-accent-rgb), 0.3)`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)'
        }
      }}
    >
      {dark ? <LightModeIcon style={{ color: 'var(--orange-accent)' }} /> : <DarkModeIcon style={{ color: 'var(--orange-accent)' }} />}
    </ActionIcon>
  );
}; 