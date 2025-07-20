# SnakeRoyale - Battle Royale Snake Game

A Slither.io-inspired real-money battle royale game with fast-paced 5-minute matches. Up to 100 players compete inside a shrinking zone where health equals size. Players can join matches by buying in at fixed tiers ($1, $5, $10, $20) with the top 5 earning real cash based on final placement.

## Features

### Core Gameplay
- **Battle Royale Format**: Up to 100 players in 5-minute matches
- **Shrinking Zone**: Circular safe zone that continuously shrinks
- **Snake Growth**: Eat food to grow larger and more powerful
- **Player Elimination**: Larger snakes can eat smaller ones
- **Real-time Multiplayer**: WebSocket-based real-time gameplay

### Betting System
- **Four Betting Tiers**: $1, $5, $10, $20 entry fees
- **Payout Distribution**: 90% of pot distributed to top 5 players
  - 1st Place: 75% of pot
  - 2nd Place: 9% of pot
  - 3rd Place: 3% of pot
  - 4th Place: 2% of pot
  - 5th Place: 1% of pot
- **Platform Fee**: 10% platform fee

### Matchmaking
- **Tier-based Matchmaking**: Players matched by betting tier
- **Early Start Voting**: Matches can start early if >50% vote (minimum 20 players)
- **Auto-start**: Matches start automatically when 100 players join

### Game Mechanics
- **Zone Damage**: Leaving the safe zone causes rapid size reduction
- **Food System**: Collect food to grow and earn money
- **Collision Detection**: Physics-based player interactions
- **Trail Effects**: Visual snake trails for better gameplay

### UI/UX Features
- **Modern Interface**: Beautiful gradient design with glassmorphism effects
- **Real-time HUD**: Live stats including rank, size, kills, and earnings
- **Post-match Screen**: Detailed results with placement, earnings, and stats
- **Responsive Design**: Works on desktop and mobile browsers

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SnakeRoyale-Master
   ```

2. **Choose your server option:**

   **Option A: Simple HTTP Server (Recommended for quick start)**
   ```bash
   node server.mjs
   ```
   Then open `http://localhost:3000` in your browser.

   **Option B: Full Multiplayer Server**
   ```bash
   npm install
   npm start
   ```
   Then open `http://localhost:3000` in your browser.

3. **Alternative: No Server Required**
   Simply open `demo.html` in any web browser for the single-player demo!

### Development Mode
```bash
# Simple server with auto-reload
npm run dev-simple

# Full multiplayer server with auto-reload
npm run dev
```

## Game Controls

### Desktop
- **Arrow Keys**: Move the snake
- **Mouse**: Click and drag to move towards cursor
- **Space**: Boost (if implemented)

### Mobile
- **Touch**: Tap and drag to move
- **Swipe**: Quick directional movement

## Technical Architecture

### Frontend
- **HTML5/WebGL**: Phaser.js game engine
- **Real-time Communication**: Socket.io client
- **UI Framework**: Vanilla JavaScript with modern CSS
- **Responsive Design**: Mobile-first approach

### Backend
- **Server**: Node.js with Express
- **Real-time**: Socket.io for WebSocket connections
- **Game Logic**: Server-authoritative gameplay
- **Matchmaking**: Tier-based player pooling

### Key Components

#### Server (`server.js`)
- Handles WebSocket connections
- Manages game lobbies and matches
- Processes player movements and actions
- Calculates payouts and match results

#### Game Scene (`public/js/game.js`)
- Phaser.js game scene implementation
- Player movement and collision detection
- Food spawning and collection
- Zone shrinking mechanics

#### Main UI (`public/js/main.js`)
- Socket.io client management
- UI state management
- Betting tier selection
- Post-match result display

## Game Flow

1. **Main Menu**: Player selects betting tier
2. **Lobby**: Wait for other players (up to 100)
3. **Match Start**: All players spawn in the game world
4. **Gameplay**: Collect food, avoid zone damage, eliminate opponents
5. **Match End**: Top 5 players receive payouts
6. **Results**: Post-match screen with detailed stats

## Development Notes

### Fake Money System
This implementation uses a fake money system for demonstration purposes. In a production environment, you would integrate with:
- Real payment processors
- Secure wallet systems
- Regulatory compliance frameworks

### Multiplayer Implementation
The current version includes the foundation for multiplayer but focuses on single-player gameplay. To implement full multiplayer:
- Add other player rendering in GameScene
- Implement player synchronization
- Add real-time leaderboards
- Implement spectate functionality

### Scalability Considerations
For production deployment:
- Use Redis for session management
- Implement horizontal scaling
- Add load balancing
- Use CDN for static assets
- Implement proper error handling and logging

## Future Enhancements

### Planned Features
- **Friends System**: Add and spectate friends
- **Leaderboards**: Global and tier-specific rankings
- **Cosmetics**: Unlockable skins and effects
- **Tournaments**: Special event matches
- **Mobile App**: Native mobile applications

### Technical Improvements
- **Performance**: Optimize for 100+ concurrent players
- **Security**: Implement anti-cheat measures
- **Analytics**: Player behavior tracking
- **A/B Testing**: Game balance optimization

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please open an issue on the GitHub repository. 