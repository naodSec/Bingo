export interface Player {
  id: string;
  name: string;
  email: string;
  telegramId?: string;
  avatar?: string;
  isOnline: boolean;
}

export interface BingoSquare {
  number: number;
  marked: boolean;
  called: boolean;
}

export interface BingoCard {
  id: string;
  playerId: string;
  B: BingoSquare[];
  I: BingoSquare[];
  N: BingoSquare[];
  G: BingoSquare[];
  O: BingoSquare[];
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  status: 'waiting' | 'starting' | 'playing' | 'completed';
  calledNumbers: number[];
  currentCall: number | null;
  createdAt: Date | any;
  gameStartedAt?: Date | any;
  gameEndedAt?: Date | any;
  lastCallTime?: Date | any;
  numberCallInterval?: number; // milliseconds between number calls
  telegramBotEnabled?: boolean;
  telegramChannelId?: string;
  winnerId?: string;
  winPattern?: string;
  winAmount?: number;
}

export interface Payment {
  id: string;
  playerId: string;
  gameRoomId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  chapaReference: string;
  createdAt: Date;
  completedAt?: Date;
}