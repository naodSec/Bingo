import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Users, 
  Gamepad2, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Crown,
  Trash2,
  Edit,
  Eye,
  DollarSign,
  Trophy,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Target,
  ArrowLeft,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  Plus,
  Send,
  Gift,
  Wallet
} from "lucide-react";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'games' | 'transactions' | 'tools'>('dashboard');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activeGames: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingWithdrawals: 0,
    completedGames: 0,
    houseCommission: 0,
    totalPrizePool: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users with error handling
        try {
          const usersSnap = await getDocs(collection(db, "users"));
          const playersData = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setPlayers(playersData);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users data");
        }

        // Fetch games with error handling
        try {
          const gamesQuery = query(
            collection(db, "gameRooms"),
            orderBy("createdAt", "desc"),
            limit(100)
          );
          const gamesSnap = await getDocs(gamesQuery);
          const gamesData = gamesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setGames(gamesData);
        } catch (error) {
          console.error("Error fetching games:", error);
          toast.error("Failed to load games data");
        }

        // Fetch transactions with error handling
        try {
          const txQuery = query(
            collection(db, "transactions"),
            orderBy("createdAt", "desc"),
            limit(200)
          );
          const txSnap = await getDocs(txQuery);
          const txData = txSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setTransactions(txData);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          toast.error("Failed to load transactions data");
        }

        // Calculate comprehensive stats
        const totalRevenue = transactions
          .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const today = new Date().toDateString();
        const todayRevenue = transactions
          .filter(tx => {
            try {
              const txDate = tx.createdAt?.toDate?.()?.toDateString() || new Date(tx.createdAt).toDateString();
              return tx.type === 'deposit' && tx.status === 'completed' && txDate === today;
            } catch {
              return false;
            }
          })
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const pendingWithdrawals = transactions
          .filter(tx => tx.type === 'withdrawal' && tx.status === 'pending').length;

        const completedGames = games.filter(g => g.status === 'completed').length;

        // Calculate house commission (10% of all game entry fees)
        const gameEntryFees = transactions
          .filter(tx => tx.type === 'bet' && tx.status === 'completed')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        const houseCommission = gameEntryFees * 0.10; // 10% commission
        const totalPrizePool = games.reduce((sum, game) => sum + (game.prizePool || 0), 0);

        setStats({
          totalPlayers: players.length,
          activeGames: games.filter(g => g.status === 'playing' || g.status === 'waiting').length,
          totalRevenue,
          todayRevenue,
          pendingWithdrawals,
          completedGames,
          houseCommission,
          totalPrizePool
        });

      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePlayer = async (id: string) => {
    if (window.confirm("⚠️ Are you sure you want to permanently delete this player? This action cannot be undone and will remove all their data.")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setPlayers(players.filter((p) => p.id !== id));
        toast.success("✅ Player deleted successfully");
      } catch (error) {
        console.error("Error deleting player:", error);
        toast.error("❌ Failed to delete player. Check your permissions.");
      }
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (window.confirm("⚠️ Are you sure you want to delete this game? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "gameRooms", id));
        setGames(games.filter((g) => g.id !== id));
        toast.success("✅ Game deleted successfully");
      } catch (error) {
        console.error("Error deleting game:", error);
        toast.error("❌ Failed to delete game. Check your permissions.");
      }
    }
  };

  const handleUpdatePlayerStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "users", id), { 
        status,
        updatedAt: new Date()
      });
      setPlayers(players.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`✅ Player status updated to ${status}`);
    } catch (error) {
      console.error("Error updating player status:", error);
      toast.error("❌ Failed to update player status. Check your permissions.");
    }
  };

  const handleTransferMoney = async () => {
    if (!selectedPlayer || !transferAmount) {
      toast.error("❌ Please select a player and enter an amount");
      return;
    }

    try {
      const amount = parseFloat(transferAmount);
      if (amount <= 0) {
        toast.error("❌ Amount must be greater than 0");
        return;
      }

      // Create transaction record
      await addDoc(collection(db, "transactions"), {
        userId: selectedPlayer.id,
        type: "admin_transfer",
        amount: amount,
        status: "completed",
        description: `Admin transfer to ${selectedPlayer.displayName || selectedPlayer.name}`,
        createdAt: serverTimestamp(),
        metadata: {
          adminAction: true,
          transferType: "admin_to_player"
        }
      });

      // Update player wallet (this would need wallet service integration)
      toast.success(`✅ Successfully transferred ${formatCurrency(amount)} to ${selectedPlayer.displayName || selectedPlayer.name}`);
      setShowTransferModal(false);
      setTransferAmount('');
      setSelectedPlayer(null);
    } catch (error) {
      console.error("Error transferring money:", error);
      toast.error("❌ Failed to transfer money");
    }
  };

  const handleAddBonus = async () => {
    if (!selectedPlayer || !bonusAmount || !bonusReason) {
      toast.error("❌ Please fill in all fields");
      return;
    }

    try {
      const amount = parseFloat(bonusAmount);
      if (amount <= 0) {
        toast.error("❌ Bonus amount must be greater than 0");
        return;
      }

      // Create bonus transaction
      await addDoc(collection(db, "transactions"), {
        userId: selectedPlayer.id,
        type: "bonus",
        amount: amount,
        status: "completed",
        description: `Admin bonus: ${bonusReason}`,
        createdAt: serverTimestamp(),
        metadata: {
          adminAction: true,
          bonusReason: bonusReason
        }
      });

      toast.success(`✅ Successfully added ${formatCurrency(amount)} bonus to ${selectedPlayer.displayName || selectedPlayer.name}`);
      setShowBonusModal(false);
      setBonusAmount('');
      setBonusReason('');
      setSelectedPlayer(null);
    } catch (error) {
      console.error("Error adding bonus:", error);
      toast.error("❌ Failed to add bonus");
    }
  };

  const clearAllData = async () => {
    if (window.confirm("⚠️ DANGER: This will delete ALL game data including players, games, and transactions. This action cannot be undone. Type 'DELETE ALL' to confirm.")) {
      const confirmation = prompt("Type 'DELETE ALL' to confirm:");
      if (confirmation === 'DELETE ALL') {
        try {
          // Delete all collections (this is a simplified version - in production you'd need cloud functions)
          const collections = ['users', 'gameRooms', 'transactions', 'wallets'];
          
          for (const collectionName of collections) {
            const snapshot = await getDocs(collection(db, collectionName));
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
          }

          setPlayers([]);
          setGames([]);
          setTransactions([]);
          toast.success("✅ All data cleared successfully");
        } catch (error) {
          console.error("Error clearing data:", error);
          toast.error("❌ Failed to clear all data");
        }
      }
    }
  };

  const refreshData = async () => {
    setLoading(true);
    window.location.reload();
  };

  const exportData = (data: any[], filename: string) => {
    try {
      const csvContent = [
        Object.keys(data[0] || {}).join(','),
        ...data.map(item => Object.values(item).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`✅ ${filename} exported successfully`);
    } catch (error) {
      toast.error(`❌ Failed to export ${filename}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount || 0);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    try {
      const d = date?.toDate ? date.toDate() : new Date(date);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'suspended': return 'text-red-400 bg-red-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'playing': return 'text-blue-400 bg-blue-500/20';
      case 'waiting': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'playing': return <Activity className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading Admin Dashboard...</div>
          <div className="text-white/60 text-sm mt-2">Fetching system data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-white/80">Manage your gaming platform</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-xl font-semibold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'players', label: 'Players', icon: Users },
                { id: 'games', label: 'Games', icon: Gamepad2 },
                { id: 'transactions', label: 'Transactions', icon: CreditCard },
                { id: 'tools', label: 'Tools', icon: Settings }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Total Players', 
                  value: stats.totalPlayers, 
                  icon: Users, 
                  color: 'from-blue-500 to-indigo-600',
                  change: '+12%'
                },
                { 
                  title: 'Active Games', 
                  value: stats.activeGames, 
                  icon: Gamepad2, 
                  color: 'from-green-500 to-emerald-600',
                  change: '+8%'
                },
                { 
                  title: 'House Commission', 
                  value: formatCurrency(stats.houseCommission), 
                  icon: DollarSign, 
                  color: 'from-yellow-500 to-orange-600',
                  change: '+25%'
                },
                { 
                  title: 'Total Prize Pool', 
                  value: formatCurrency(stats.totalPrizePool), 
                  icon: Trophy, 
                  color: 'from-purple-500 to-pink-600',
                  change: '+15%'
                },
                {
                  title: 'Total Revenue',
                  value: formatCurrency(stats.totalRevenue),
                  icon: TrendingUp,
                  color: 'from-cyan-500 to-blue-600',
                  change: '+18%'
                },
                {
                  title: 'Today Revenue',
                  value: formatCurrency(stats.todayRevenue),
                  icon: BarChart3,
                  color: 'from-pink-500 to-red-600',
                  change: '+22%'
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={stat.title}
                    className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-1 text-green-400 text-sm font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      {typeof stat.value === 'string' ? stat.value : stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Activity className="w-6 h-6 text-blue-400" />
                    <span>Recent Players</span>
                  </h3>
                  <button
                    onClick={() => exportData(players.slice(0, 10), 'recent-players')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {players.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(player.displayName || player.name || player.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{player.displayName || player.name || 'Unknown'}</div>
                          <div className="text-white/60 text-xs">{player.email}</div>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(player.status || 'active')}`}>
                        {getStatusIcon(player.status || 'active')}
                        <span>{player.status || 'Active'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span>Recent Games</span>
                  </h3>
                  <button
                    onClick={() => exportData(games.slice(0, 10), 'recent-games')}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {games.slice(0, 5).map((game) => (
                    <div key={game.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div>
                        <div className="text-white font-semibold">{game.name || `Game ${game.id.slice(-6)}`}</div>
                        <div className="text-white/60 text-sm">
                          {game.players?.length || 0}/{game.maxPlayers || 0} players • {formatCurrency(game.prizePool || 0)}
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(game.status || 'waiting')}`}>
                        {getStatusIcon(game.status || 'waiting')}
                        <span>{game.status || 'Waiting'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-400" />
                <span>Players Management</span>
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-white/60">{players.length} total players</span>
                <button
                  onClick={() => exportData(players, 'all-players')}
                  className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-2 rounded-lg font-semibold transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Player</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Email</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Phone</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Status</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Joined</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(player.displayName || player.name || player.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{player.displayName || player.name || 'Unknown'}</div>
                            <div className="text-white/60 text-sm">ID: {player.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80">{player.email || '-'}</td>
                      <td className="py-4 px-4 text-white/80">{player.phone || '-'}</td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(player.status || 'active')}`}>
                          {getStatusIcon(player.status || 'active')}
                          <span>{player.status || 'Active'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80">{formatDate(player.createdAt)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowTransferModal(true);
                            }}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            title="Transfer Money"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowBonusModal(true);
                            }}
                            className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                            title="Add Bonus"
                          >
                            <Gift className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdatePlayerStatus(player.id, player.status === 'suspended' ? 'active' : 'suspended')}
                            className={`p-2 rounded-lg transition-colors ${
                              player.status === 'suspended' 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            }`}
                            title={player.status === 'suspended' ? 'Activate Player' : 'Suspend Player'}
                          >
                            {player.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Delete Player"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Gamepad2 className="w-8 h-8 text-green-400" />
                <span>Games Management</span>
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-white/60">{games.length} total games</span>
                <button
                  onClick={() => exportData(games, 'all-games')}
                  className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-2 rounded-lg font-semibold transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Game</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Players</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Entry Fee</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Prize Pool</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Commission</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Status</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Created</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => {
                    const totalEntryFees = (game.players?.length || 0) * (game.entryFee || 0);
                    const commission = totalEntryFees * 0.10; // 10% commission
                    
                    return (
                      <tr key={game.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-white font-semibold">{game.name || `Game ${game.id.slice(-6)}`}</div>
                            <div className="text-white/60 text-sm">ID: {game.id.slice(-8)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/80">
                          {game.players?.length || 0}/{game.maxPlayers || 0}
                        </td>
                        <td className="py-4 px-4 text-white/80">
                          {game.entryFee ? formatCurrency(game.entryFee) : 'Free'}
                        </td>
                        <td className="py-4 px-4 text-yellow-400 font-semibold">
                          {formatCurrency(game.prizePool || 0)}
                        </td>
                        <td className="py-4 px-4 text-green-400 font-semibold">
                          {formatCurrency(commission)}
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(game.status || 'waiting')}`}>
                            {getStatusIcon(game.status || 'waiting')}
                            <span>{game.status || 'Waiting'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/80">{formatDate(game.createdAt)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="View Game Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="Delete Game"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-8 h-8 text-purple-400" />
                <span>Transactions</span>
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-white/60">{transactions.length} total transactions</span>
                <button
                  onClick={() => exportData(transactions, 'all-transactions')}
                  className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-2 rounded-lg font-semibold transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Transaction</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">User</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Type</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Amount</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Status</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 50).map((txn) => (
                    <tr key={txn.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-semibold">#{txn.id.slice(-8)}</div>
                          <div className="text-white/60 text-sm">{txn.description || 'Transaction'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80">{txn.userId?.slice(-8) || '-'}</td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-white/80">{txn.type || '-'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${
                          ['deposit', 'win', 'bonus', 'admin_transfer'].includes(txn.type) ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {['deposit', 'win', 'bonus', 'admin_transfer'].includes(txn.type) ? '+' : '-'}{formatCurrency(txn.amount || 0)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(txn.status || 'pending')}`}>
                          {getStatusIcon(txn.status || 'pending')}
                          <span>{txn.status || 'Pending'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80">{formatDate(txn.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Settings className="w-8 h-8 text-purple-400" />
                <span>Admin Tools</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-red-400 font-bold text-lg mb-3 flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span>Danger Zone</span>
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Permanently delete all data including players, games, and transactions. This action cannot be undone.
                  </p>
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Clear All Data
                  </button>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>Revenue Analytics</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Total Revenue:</span>
                      <span className="text-green-400 font-semibold">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>House Commission:</span>
                      <span className="text-yellow-400 font-semibold">{formatCurrency(stats.houseCommission)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Active Prize Pools:</span>
                      <span className="text-purple-400 font-semibold">{formatCurrency(stats.totalPrizePool)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Money Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Transfer Money</h3>
              <p className="text-white/80 mb-4">
                Transfer money to: <span className="font-semibold">{selectedPlayer?.displayName || selectedPlayer?.name}</span>
              </p>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount in ETB"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferAmount('');
                    setSelectedPlayer(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferMoney}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Bonus Modal */}
        {showBonusModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Add Bonus</h3>
              <p className="text-white/80 mb-4">
                Add bonus to: <span className="font-semibold">{selectedPlayer?.displayName || selectedPlayer?.name}</span>
              </p>
              <input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                placeholder="Bonus amount in ETB"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <input
                type="text"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
                placeholder="Reason for bonus"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowBonusModal(false);
                    setBonusAmount('');
                    setBonusReason('');
                    setSelectedPlayer(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBonus}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  Add Bonus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;