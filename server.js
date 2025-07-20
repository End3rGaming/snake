const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Game state
const lobbies = new Map();
const players = new Map();
const matches = new Map();

// Betting tiers
const BETTING_TIERS = {
  TIER_1: { amount: 1, name: '$1 Lobby' },
  TIER_5: { amount: 5, name: '$5 Lobby' },
  TIER_10: { amount: 10, name: '$10 Lobby' },
  TIER_20: { amount: 20, name: '$20 Lobby' }
};

// Payout distribution (90% of pot to top 5)
const PAYOUT_DISTRIBUTION = {
  1: 0.75, // 75% to 1st place
  2: 0.09, // 9% to 2nd place
  3: 0.03, // 3% to 3rd place
  4: 0.02, // 2% to 4th place
  5: 0.01  // 1% to 5th place
};

// Initialize lobbies for each tier
Object.keys(BETTING_TIERS).forEach(tier => {
  lobbies.set(tier, {
    players: [],
    matchId: null,
    startTime: null,
    voteCount: 0,
    totalPlayers: 0
  });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Join lobby
  socket.on('join_lobby', (data) => {
    const { tier, playerName } = data;
    
    if (!BETTING_TIERS[tier]) {
      socket.emit('error', { message: 'Invalid betting tier' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName || `Player_${socket.id.slice(0, 6)}`,
      tier: tier,
      balance: 1000, // Starting fake balance
      level: 1,
      xp: 0
    };

    players.set(socket.id, player);
    socket.join(tier);
    
    const lobby = lobbies.get(tier);
    lobby.players.push(player);
    lobby.totalPlayers = lobby.players.length;

    // Notify all players in lobby
    io.to(tier).emit('lobby_update', {
      players: lobby.players,
      totalPlayers: lobby.totalPlayers
    });

    // Check if match should start
    checkMatchStart(tier);
  });

  // Vote to start match early
  socket.on('vote_start', (data) => {
    const { tier } = data;
    const lobby = lobbies.get(tier);
    
    if (lobby && lobby.players.length >= 20) {
      lobby.voteCount++;
      const votePercentage = lobby.voteCount / lobby.players.length;
      
      if (votePercentage > 0.5) {
        startMatch(tier);
      } else {
        io.to(tier).emit('vote_update', {
          votes: lobby.voteCount,
          total: lobby.players.length,
          percentage: Math.round(votePercentage * 100)
        });
      }
    }
  });

  // Game events
  socket.on('player_move', (data) => {
    const match = getMatchByPlayer(socket.id);
    if (match) {
      socket.to(match.id).emit('player_moved', {
        playerId: socket.id,
        x: data.x,
        y: data.y,
        angle: data.angle
      });
    }
  });

  socket.on('player_eat', (data) => {
    const match = getMatchByPlayer(socket.id);
    if (match) {
      socket.to(match.id).emit('player_ate', {
        playerId: socket.id,
        foodId: data.foodId,
        growth: data.growth
      });
    }
  });

  socket.on('player_died', (data) => {
    const match = getMatchByPlayer(socket.id);
    if (match) {
      const player = players.get(socket.id);
      if (player) {
        player.placement = data.placement;
        player.kills = data.kills;
        player.survivalTime = data.survivalTime;
        player.earnings = data.earnings;
        player.xpEarned = data.xpEarned;
      }
      
      socket.to(match.id).emit('player_died', {
        playerId: socket.id,
        placement: data.placement
      });
    }
  });

  // Spectate events
  socket.on('spectate_match', (data) => {
    const { matchId } = data;
    const match = matches.get(matchId);
    if (match) {
      socket.join(matchId);
      socket.emit('spectate_joined', { matchId });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Remove from all lobbies
    for (const [tier, lobby] of lobbies.entries()) {
      lobby.players = lobby.players.filter(p => p.id !== socket.id);
      lobby.totalPlayers = lobby.players.length;
    }
    
    // Remove from matches
    for (const [matchId, match] of matches.entries()) {
      match.players = match.players.filter(p => p.id !== socket.id);
      if (match.players.length === 0) {
        matches.delete(matchId);
      }
    }
    
    players.delete(socket.id);
  });
});

// Helper functions
function checkMatchStart(tier) {
  const lobby = lobbies.get(tier);
  if (lobby.players.length >= 100 || (lobby.players.length >= 20 && lobby.voteCount / lobby.players.length > 0.5)) {
    startMatch(tier);
  }
}

function startMatch(tier) {
  const lobby = lobbies.get(tier);
  const matchId = uuidv4();
  
  const match = {
    id: matchId,
    tier: tier,
    players: [...lobby.players],
    startTime: Date.now(),
    endTime: null,
    zone: {
      x: 400,
      y: 300,
      radius: 300,
      shrinkRate: 0.5
    },
    food: generateFood(50),
    status: 'active'
  };

  matches.set(matchId, match);
  lobby.matchId = matchId;
  lobby.startTime = Date.now();
  lobby.voteCount = 0;

  // Notify all players in the match
  io.to(tier).emit('match_started', {
    matchId: matchId,
    players: match.players,
    zone: match.zone,
    food: match.food
  });

  // Start match timer
  setTimeout(() => {
    endMatch(matchId);
  }, 5 * 60 * 1000); // 5 minutes
}

function endMatch(matchId) {
  const match = matches.get(matchId);
  if (!match) return;

  match.status = 'ended';
  match.endTime = Date.now();

  // Calculate payouts
  const tier = BETTING_TIERS[match.tier];
  const pot = match.players.length * tier.amount;
  const payout = pot * 0.9; // 90% to players, 10% platform fee

  const sortedPlayers = match.players
    .filter(p => p.placement)
    .sort((a, b) => a.placement - b.placement);

  // Distribute payouts
  sortedPlayers.slice(0, 5).forEach((player, index) => {
    const rank = index + 1;
    const playerPayout = payout * PAYOUT_DISTRIBUTION[rank];
    player.earnings = playerPayout;
    player.balance += playerPayout;
  });

  // Send match results
  io.to(matchId).emit('match_ended', {
    matchId: matchId,
    results: sortedPlayers,
    pot: pot,
    payout: payout
  });

  // Clear lobby
  const lobby = lobbies.get(match.tier);
  lobby.players = [];
  lobby.matchId = null;
  lobby.startTime = null;
  lobby.totalPlayers = 0;
}

function generateFood(count) {
  const food = [];
  for (let i = 0; i < count; i++) {
    food.push({
      id: uuidv4(),
      x: Math.random() * 800,
      y: Math.random() * 600,
      value: Math.random() * 0.5 + 0.1,
      type: Math.random() > 0.8 ? 'bonus' : 'normal'
    });
  }
  return food;
}

function getMatchByPlayer(playerId) {
  for (const [matchId, match] of matches.entries()) {
    if (match.players.find(p => p.id === playerId)) {
      return match;
    }
  }
  return null;
}

// API Routes
app.get('/api/lobbies', (req, res) => {
  const lobbyData = {};
  for (const [tier, lobby] of lobbies.entries()) {
    lobbyData[tier] = {
      totalPlayers: lobby.totalPlayers,
      tier: BETTING_TIERS[tier]
    };
  }
  res.json(lobbyData);
});

app.get('/api/players/:id', (req, res) => {
  const player = players.get(req.params.id);
  if (player) {
    res.json(player);
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SnakeRoyale server running on port ${PORT}`);
}); 
