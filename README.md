# GraviTV

A Twitch streaming viewer application with a custom chat that combines Twitch messages with local custom messages.

## Features

- Watch Twitch streams in a clean, modern interface
- Integrated chat system that combines Twitch and custom messages
- Send custom messages that appear alongside Twitch chat messages
- Save your preferred username for custom chat messages
- Add, remove and manage your favorite streamers
- Auto-refresh stream data
- Light/dark mode support
- Responsive design for different screen sizes

## Custom Chat Implementation

The application implements a fully integrated chat component that:

1. Directly connects to Twitch chat using the tmi.js library
2. Displays Twitch chat messages in real-time
3. Allows users to send custom messages that appear in the same chat window
4. Visually distinguishes between Twitch messages and custom messages
5. Stores the username locally to persist between sessions

### How It Works

- The chat connects directly to Twitch's IRC servers using tmi.js
- Twitch messages are received in real-time and displayed with purple accents
- Custom messages from the local user are displayed with teal accents
- All messages share the same chat window for a unified experience
- Username and messages are stored locally for a seamless experience

### Technology Used

- React with TypeScript
- Material UI for components
- Mantine for flexible layouts
- tmi.js for direct Twitch chat integration
- Local storage for saving preferences

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

## Usage

- Select a streamer from the sidebar to watch their stream
- Use the chat box at the bottom of the chat panel to send custom messages
- Twitch chat messages will appear in the same window with a different color
- Click on your username to change it
- Add new streamers with the + button in the sidebar
- Remove streamers by hovering over their name and clicking the delete icon
