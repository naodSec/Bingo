import React, { useState, useEffect } from 'react';
import { Plus, Users, Trophy, Clock, DollarSign, LogOut, Wallet, Volume2, Settings, Wifi, WifiOff, Star, Crown, Zap, Target, Gamepad2, TrendingUp, Gift, Sparkles, Play, Siren as Fire, Activity, Shield } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { gameService } from '../services/gameService';
import { walletService } from '../services/walletService';
import { languageService } from '../services/languageService';
import { voiceService } from '../services/voiceService';
import { GameRoom } from '../types/game';
import { Wallet as WalletType } from '../types/wallet';
import CreateGameModal from './CreateGameModal';
import VoiceSettings from './VoiceSettings';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface GameLobbyProps {
  onShowGameList: () => void;
}

// Admin UIDs - same as in App.tsx
const ADMIN_UIDS = [
  "YlXEWXPLKvMiWHdqRajvNzzpW883",
  // Add more admin UIDs here
];

const GameLobby: React.FC<GameLobbyProps> = ({ onShowGameList }) => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const [currentLanguage, setCurrentLanguage] = useState(languageService.getCurrentLanguage());
  const [featuredGame, setFeaturedGame] = useState<GameRoom | null>(null);
  const navigate = useNavigate();

  // Check if current user is admin
  const isAdmin = auth.currentUser && ADMIN_UIDS.includes(auth.currentUser.uid);

  useEffect(() => {
    if (!auth.currentUser?.uid) {
      setLoading(false);
      return;
    }

    let unsubscribeGameRooms: (() => void) | null = null;
    
    const setupGameRoomsSubscription = () => {
      try {
        unsubscribeGameRooms = gameService.subscribeToGameRooms((rooms) => {
          setGameRooms(rooms);
          // Set featured game (highest prize pool)
          const featured = rooms.reduce((prev, current) => 
            (prev.prizePool > current.prizePool) ? prev : current, rooms[0]
          );
          setFeaturedGame(featured);
          setLoading(false);
          setConnectionStatus('online');
        });
      } catch (error) {
        console.error('Failed to subscribe to game rooms:', error);
        setConnectionStatus('offline');
        setLoading(false);
        setTimeout(setupGameRoomsSubscription, 5000);
      }
    };

    setupGameRoomsSubscription();
    return () => {
      if (unsubscribeGameRooms) {
        unsubscribeGameRooms();
      }
    };
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    let unsubscribeWallet: (() => void) | null = null;
    
    const setupWalletSubscription = () => {
      try {
        unsubscribeWallet = walletService.subscribeToWallet(
          auth.currentUser!.uid,
          (walletData) => {
            setWallet(walletData);
            setConnectionStatus('online');
          }
        );
      } catch (error) {
        console.error('Failed to subscribe to wallet:', error);
        setConnectionStatus('offline');
        setTimeout(setupWalletSubscription, 5000);
      }
    };

    setupWalletSubscription();
    return () => {
      if (unsubscribeWallet) {
        unsubscribeWallet();
      }
    };
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    setCurrentLanguage(languageService.getCurrentLanguage());
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online');
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
      toast.error('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleJoinGame = async (gameRoom: GameRoom) => {
    if (!auth.currentUser) return;

    if (connectionStatus === 'offline') {
      toast.error('Cannot join game while offline. Please check your connection.');
      return;
    }

    if (gameRoom.entryFee > 0) {
      if (!wallet || wallet.balance < gameRoom.entryFee) {
        toast.error('Insufficient balance. Please deposit funds first.');
        navigate('/wallet');
        return;
      }

      try {
        await walletService.placeBet(
          auth.currentUser.uid,
          gameRoom.id,
          gameRoom.entryFee,
          { gameType: 'bingo', gameName: gameRoom.name }
        );

        const player = {
          id: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'Anonymous',
          email: auth.currentUser.email || '',
          isOnline: true,
          avatar: auth.currentUser.photoURL || '',
          telegramId: '',
        };

        await gameService.joinGameRoom(gameRoom.id, player);
        navigate(`/game/${gameRoom.id}`);
        toast.success('Joined game successfully!');
      } catch (error) {
        console.error('Error joining game:', error);
        toast.error('Failed to join game. Please try again.');
      }
    } else {
      try {
        const player = {
          id: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'Anonymous',
          email: auth.currentUser.email || '',
          isOnline: true,
          avatar: auth.currentUser.photoURL || '',
          telegramId: '',
        };

        await gameService.joinGameRoom(gameRoom.id, player);
        navigate(`/game/${gameRoom.id}`);
        toast.success('Joined game successfully!');
      } catch (error) {
        console.error('Error joining game:', error);
        toast.error('Failed to join game. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-green-500';
      case 'starting': return 'bg-yellow-500';
      case 'playing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return currentLanguage.phrases.waitingForPlayers || 'Waiting for Players';
      case 'starting': return currentLanguage.phrases.gameStarting || 'Starting Soon';
      case 'playing': return currentLanguage.phrases.gameStarted || 'In Progress';
      default: return 'Unknown';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'connecting': return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getPlayerLevel = (balance: number) => {
    if (balance >= 10000) return { level: 'Diamond', icon: Crown, color: 'from-cyan-400 to-blue-600' };
    if (balance >= 5000) return { level: 'Gold', icon: Trophy, color: 'from-yellow-400 to-orange-600' };
    if (balance >= 1000) return { level: 'Silver', icon: Star, color: 'from-gray-300 to-gray-600' };
    return { level: 'Bronze', icon: Target, color: 'from-orange-400 to-red-600' };
  };

  const playerLevel = getPlayerLevel(wallet?.balance || 0);
  const LevelIcon = playerLevel.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-2xl font-bold mb-2">Loading Gaming Hub...</div>
          <div className="text-white/60">Preparing your epic experience</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-yellow-500/10 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 flex items-center space-x-4">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  EPIC BINGO
                </span>
                <div className="flex items-center space-x-2">
                  <Fire className="w-8 h-8 text-orange-500 animate-pulse" />
                  <span className="text-lg bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent font-bold">
                    LIVE
                  </span>
                </div>
              </h1>
              <p className="text-white/80 text-xl flex items-center space-x-2">
                <span>
                  {currentLanguage.code === 'am-ET' ? 'ጨዋታዎችን ተቀላቀሉ፣ ሽልማቶችን ያሸንፉ፣ ይዝናኑ!' :
                   currentLanguage.code === 'om-ET' ? 'Taphoota makamuu, badhaasa mo\'aa, gammadaa!' :
                   currentLanguage.code === 'ti-ET' ? 'ጸወታታት ተሳተፉ፣ ሽልማት ዓወቱ፣ ተዘናጉዑ!' :
                   'Join games, win prizes, dominate the competition!'}
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                {getConnectionIcon()}
                <span className="text-white/80 text-sm font-semibold capitalize">{connectionStatus}</span>
              </div>

              {/* Player Level */}
              <div className={`flex items-center space-x-2 bg-gradient-to-r ${playerLevel.color} px-4 py-2 rounded-xl text-white font-bold shadow-lg`}>
                <LevelIcon className="w-5 h-5" />
                <span>{playerLevel.level}</span>
              </div>

              {/* Admin Panel Access */}
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg font-bold"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}

              {/* Voice Settings */}
              <button
                onClick={() => setShowVoiceSettings(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
              >
                <Volume2 className="w-4 h-4" />
                <span>{currentLanguage.nativeName}</span>
              </button>

              {/* Wallet */}
              <button
                onClick={() => navigate('/wallet')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg font-bold"
              >
                <Wallet className="w-5 h-5" />
                <span>{formatCurrency(wallet?.balance || 0)}</span>
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-white text-right">
                  <p className="text-sm opacity-80">Welcome back,</p>
                  <p className="font-bold">{auth.currentUser?.displayName || 'Player'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Connection Warning */}
          {connectionStatus === 'offline' && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <div className="flex items-center space-x-3 text-red-400">
                <WifiOff className="w-6 h-6" />
                <span className="font-bold text-lg">Connection Lost</span>
              </div>
              <p className="text-white/80 mt-2">
                You're currently offline. The app will automatically reconnect when your connection is restored.
              </p>
            </div>
          )}

          {/* Admin Access Info */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <div className="flex items-center space-x-3 text-red-400">
                <Shield className="w-6 h-6" />
                <span className="font-bold text-lg">Admin Access Enabled</span>
              </div>
              <p className="text-white/80 mt-2">
                You have admin privileges. Click the "Admin" button to access the admin panel.
              </p>
            </div>
          )}

          {/* Featured Game */}
          {featuredGame && (
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-r from-yellow-600/20 to-red-600/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-500/30 overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full text-white font-bold text-sm">
                  <Fire className="w-4 h-4" />
                  <span>FEATURED</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{featuredGame.name}</h2>
                    <p className="text-white/80 mb-4">Join the hottest game with the biggest prize pool!</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 rounded-xl p-4 text-center">
                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-yellow-400 font-bold text-xl">{formatCurrency(featuredGame.prizePool)}</div>
                        <div className="text-white/60 text-sm">Prize Pool</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 text-center">
                        <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-blue-400 font-bold text-xl">{featuredGame.players.length}/{featuredGame.maxPlayers}</div>
                        <div className="text-white/60 text-sm">Players</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinGame(featuredGame)}
                      disabled={featuredGame.players.length >= featuredGame.maxPlayers || connectionStatus === 'offline'}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:bg-gray-600 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3"
                    >
                      <Play className="w-6 h-6" />
                      <span>Join Featured Game</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Trophy className="w-32 h-32 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={connectionStatus === 'offline'}
              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-600 text-white p-6 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-8 h-8 mx-auto mb-2 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create Game</span>
            </button>

            <button
              onClick={onShowGameList}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <span>Browse Games</span>
            </button>

            <button
              onClick={() => navigate('/wallet')}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <Wallet className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <span>My Wallet</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="group bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-6 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <Settings className="w-8 h-8 mx-auto mb-2 group-hover:rotate-45 transition-transform duration-300" />
              <span>Profile</span>
            </button>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Active Games</h3>
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">{gameRooms.length}</div>
              <div className="text-white/60 text-sm">Games available to join</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Total Prize Pool</h3>
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {formatCurrency(gameRooms.reduce((sum, room) => sum + room.prizePool, 0))}
              </div>
              <div className="text-white/60 text-sm">Available to win</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Players Online</h3>
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {gameRooms.reduce((sum, room) => sum + room.players.length, 0)}
              </div>
              <div className="text-white/60 text-sm">Currently playing</div>
            </div>
          </div>

          {/* Game Rooms Grid */}
          {gameRooms.length === 0 ? (
            <div className="text-center text-white/80 py-16">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No Active Games</h3>
              <p className="text-lg mb-6">Be the first to create an epic game!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-8 rounded-xl font-bold transition-all transform hover:scale-105"
              >
                Create First Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Game Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white text-xl font-bold mb-1 group-hover:text-blue-300 transition-colors">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)} animate-pulse`}></div>
                        <span className="text-white/80 text-sm font-semibold">{getStatusText(room.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {room.telegramBotEnabled && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          TELEGRAM
                        </div>
                      )}
                      {room.prizePool > 1000 && (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                          <Fire className="w-3 h-3" />
                          <span>HOT</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Game Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-white/80">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Players</span>
                      </div>
                      <span className="font-bold text-white">
                        {room.players.length}/{room.maxPlayers}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-white/80">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Entry Fee</span>
                      </div>
                      <span className="font-bold text-white">
                        {room.entryFee === 0 ? (
                          <span className="text-green-400">FREE</span>
                        ) : (
                          formatCurrency(room.entryFee)
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-white/80">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4" />
                        <span>Prize Pool</span>
                      </div>
                      <span className="font-bold text-yellow-400 flex items-center space-x-1">
                        <span>{formatCurrency(room.prizePool)}</span>
                        {room.prizePool > 500 && <Sparkles className="w-4 h-4" />}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-white/80">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Created</span>
                      </div>
                      <span className="font-semibold">
                        {new Date(room.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-white/60 mb-1">
                      <span>Players</span>
                      <span>{Math.round((room.players.length / room.maxPlayers) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(room.players.length / room.maxPlayers) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinGame(room)}
                    disabled={room.players.length >= room.maxPlayers || room.status !== 'waiting' || connectionStatus === 'offline'}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      room.players.length >= room.maxPlayers || room.status !== 'waiting' || connectionStatus === 'offline'
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : room.entryFee > 0
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {connectionStatus === 'offline' ? (
                      <>
                        <WifiOff className="w-5 h-5" />
                        <span>Offline</span>
                      </>
                    ) : room.players.length >= room.maxPlayers ? (
                      <>
                        <Users className="w-5 h-5" />
                        <span>Game Full</span>
                      </>
                    ) : room.status !== 'waiting' ? (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Game Started</span>
                      </>
                    ) : room.entryFee > 0 ? (
                      <>
                        <DollarSign className="w-5 h-5" />
                        <span>Pay {formatCurrency(room.entryFee)} & Join</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Join Free Game</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modals */}
          {showCreateModal && (
            <CreateGameModal
              onClose={() => setShowCreateModal(false)}
              onGameCreated={(gameId) => {
                setShowCreateModal(false);
                navigate(`/game/${gameId}`);
              }}
            />
          )}

          <VoiceSettings
            isOpen={showVoiceSettings}
            onClose={() => setShowVoiceSettings(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLobby;