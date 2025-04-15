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

## Requirements

- Node.js 16.x or higher
- NPM 8.x or higher
- Modern browser with ES6 support
- Internet connection for fetching stream data
- Access to Twitch's services (not blocked by network)

### Technical Dependencies

- React 18.2.0
- TypeScript 5.8.3
- React Router DOM 7.5.0
- Material UI 5.10.15
- Mantine Core 7.12.2
- React Twitch Embed 3.0.1
- TMI.js 1.8.5 for Twitch chat integration
- React Player 2.11.0

### Server Requirements
- Backend API server for fetching Twitch stream data
- CORS enabled for the frontend domain
- Bandwidth suitable for streaming video content

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
   ```bash
   git clone https://github.com/hydroxios/gravitv.git
   cd gravitv
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

4. For production build
   ```bash
   npm run build
   ```
   This will create optimized files in the `build` folder

### Environment Setup

This application does not require any API keys or environment variables as it uses publicly available Twitch data through a proxy server. However, if you want to modify the API endpoint, you can edit the URL in `src/hooks/useStreamers.ts`.

## Usage

- Select a streamer from the sidebar to watch their stream
- Use the chat box at the bottom of the chat panel to send custom messages
- Twitch chat messages will appear in the same window with a different color
- Click on your username to change it
- Add new streamers with the + button in the sidebar
- Remove streamers by hovering over their name and clicking the delete icon

## Troubleshooting

### Common Issues

1. **Duplicated Streamer List**
   - If you notice streamers appearing twice in the sidebar, it's likely due to duplicate API calls to fetch streamers. This has been fixed in the latest version by optimizing API calls in the `useStreamers` hook.

2. **Stream Not Loading**
   - Check your internet connection
   - Verify that the streamer is currently live
   - Try refreshing the page
   - Ensure that Twitch services are not blocked on your network

3. **Chat Not Connecting**
   - The chat connects to Twitch's IRC servers. If your network blocks IRC connections, chat functionality may not work.
   - Try using a different network or checking your firewall settings.

4. **Missing Avatars**
   - Avatar images are fetched from Twitch's API. If they don't load, it might be due to API rate limiting.
   - The application will retry loading avatars on the next refresh cycle.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
