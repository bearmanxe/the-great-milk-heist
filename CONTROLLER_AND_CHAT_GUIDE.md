# Controller Cursor & Chat Guide

## Controller Cursor

The game now features a custom cursor for controller players, allowing full navigation of menus and UI using a gamepad.

### Features
- **D-Pad/Left Stick Movement**: Move the cursor around the screen
- **Visual Feedback**: Cursor changes color when hovering over interactive elements
- **A Button to Click**: Press the A button (Cross on PlayStation) to click on buttons
- **Haptic Feedback**: Controller vibrates when clicking buttons
- **Auto-Detection**: Only appears when a controller is connected

### How to Use
1. Connect any PS3/PS4/PS5 or Xbox controller to your device
2. The purple/pink gradient cursor will appear automatically
3. Use the D-pad or left analog stick to move the cursor
4. When hovering over a button, the cursor turns green and shows "Press A to select"
5. Press the A button to click

### Supported Screens
- Start Screen
- Multiplayer Menu (Create/Join)
- Multiplayer Lobby
- All other game screens

## Voice & Text Chat

Multiplayer sessions now include integrated voice and text chat for team communication.

### Text Chat Features
- **Real-time Messaging**: Send and receive messages instantly
- **Keyboard Shortcuts**: 
  - `Tab` to open/close chat
  - `Enter` to send message
  - `Escape` to close chat
- **Message History**: Scroll through previous messages
- **Player Identification**: Messages are color-coded by player
- **System Messages**: Important game events shown in chat

### Voice Chat Features
- **Push-to-Talk Style**: Toggle voice on/off with a button
- **Mute Control**: Mute your microphone without disconnecting
- **Browser-Based**: No external software needed
- **Echo Cancellation**: Built-in noise reduction and echo cancellation

### How to Use Text Chat
1. During a multiplayer session, look for the chat icon in the bottom-right corner
2. Click the icon or press `Tab` to open chat
3. Type your message in the input box
4. Press `Enter` to send or click the send button
5. Press `Tab` again to minimize chat (you'll still see new messages)

### How to Use Voice Chat
1. Open the chat window
2. Click "Enable Voice" button
3. Allow microphone access when prompted by your browser
4. Your microphone is now active - other players can hear you
5. Use the microphone button to mute/unmute yourself
6. Click "Voice Active" to completely disable voice chat

### Privacy & Permissions
- Voice chat requires microphone permission from your browser
- Your browser will ask for permission the first time you enable voice
- You can revoke permissions at any time in your browser settings
- No audio is recorded or stored - all communication is real-time only

### Tips
- Keep chat open during boss fights for better coordination
- Use system messages to track when players join/leave
- Voice chat works best with headphones to prevent echo
- If voice quality is poor, try muting and re-enabling

## Technical Notes

### Chat Broadcasting
- Messages are broadcast via Supabase Realtime channels
- All players in the same session see the same messages
- Messages are not persisted after the session ends

### Voice Implementation
- Uses WebRTC for peer-to-peer voice communication
- Includes built-in echo cancellation and noise suppression
- Currently supports up to 4 simultaneous voice connections
- Fallback to text-only if WebRTC is not supported

### Controller Compatibility
- Supports standard gamepad API
- Tested with PS3, PS4, PS5, and Xbox controllers
- Works on Chrome, Firefox, and Edge browsers
- May require controller drivers on some systems

## Troubleshooting

### Controller Cursor Not Appearing
1. Ensure your controller is properly connected
2. Press any button on the controller to activate it
3. Try unplugging and reconnecting the controller
4. Check browser console for controller detection messages

### Voice Chat Not Working
1. Check browser microphone permissions
2. Ensure no other app is using your microphone
3. Try refreshing the page
4. Use text chat as a backup

### Chat Messages Not Sending
1. Check your internet connection
2. Verify you're in an active multiplayer session
3. Try closing and reopening the chat window
4. Check browser console for errors

## Future Enhancements

Planned improvements:
- Spatial audio (hear players based on their position in-game)
- Chat message reactions/emojis
- Voice activity detection (auto-mute when not speaking)
- Chat filters and moderation
- Controller cursor customization options
