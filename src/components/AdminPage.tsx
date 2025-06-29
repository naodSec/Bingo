import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
  Target
} from "lucide-react";

const AdminPage: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'games' | 'transactions'>('dashboard');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activeGames: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersSnap = await getDocs(collection(db, "users"));
        const playersData = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersData);

        // Fetch games
        const gamesSnap = await getDocs(collection(db, "gameRooms"));
        const gamesData = gamesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGames(gamesData);

        // Fetch transactions
        const txSnap = await getDocs(collection(db, "transactions"));
        const txData = txSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(txData);

        // Calculate stats
        const totalRevenue = txData
          .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const today = new Date().toDateString();
        const todayRevenue = txData
          .filter(tx => {
            const txDate = tx.createdAt?.toDate?.()?.toDateString() || new Date(tx.createdAt).toDateString();
            return tx.type === 'deposit' && tx.status === 'completed' && txDate === today;
          })
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);

        setStats({
          totalPlayers: playersData.length,
          activeGames: gamesData.filter(g => g.status === 'playing' || g.status === 'waiting').length,
          totalRevenue,
          todayRevenue
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePlayer = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setPlayers(players.filter((p) => p.id !== id));
        toast.success("Player deleted successfully");
      } catch (error) {
        toast.error("Failed to delete player");
      }
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await deleteDoc(doc(db, "gameRooms", id));
        setGames(games.filter((g) => g.id !== id));
        toast.success("Game deleted successfully");
      } catch (error) {
        toast.error("Failed to delete game");
      }
    }
  };

  const handleUpdatePlayerStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "users", id), { status });
      setPlayers(players.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`Player status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update player status");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
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
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'players', label: 'Players', icon: Users },
              { id: 'games', label: 'Games', icon: Gamepad2 },
              { id: 'transactions', label: 'Transactions', icon: CreditCard }
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
                  title: 'Total Revenue', 
                  value: formatCurrency(stats.totalRevenue), 
                  icon: DollarSign, 
                  color: 'from-yellow-500 to-orange-600',
                  change: '+25%'
                },
                { 
                  title: 'Today Revenue', 
                  value: formatCurrency(stats.todayRevenue), 
                  icon: TrendingUp, 
                  color: 'from-purple-500 to-pink-600',
                  change: '+15%'
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
                      {typeof stat.value === 'number' && stat.title.includes('Revenue') ? stat.value : stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <span>Recent Players</span>
                </h3>
                <div className="space-y-3">
                  {players.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(player.displayName || player.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{player.displayName || 'Unknown'}</div>
                          <div className="text-white/60 text-sm">{player.email}</div>
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span>Recent Games</span>
                </h3>
                <div className="space-y-3">
                  {games.slice(0, 5).map((game) => (
                    <div key={game.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div>
                        <div className="text-white font-semibold">{game.name || `Game ${game.id.slice(-6)}`}</div>
                        <div className="text-white/60 text-sm">
                          {game.players?.length || 0}/{game.maxPlayers || 0} players
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
              <div className="text-white/60">{players.length} total players</div>
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
                            {(player.displayName || player.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{player.displayName || 'Unknown'}</div>
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
                            onClick={() => handleUpdatePlayerStatus(player.id, player.status === 'suspended' ? 'active' : 'suspended')}
                            className={`p-2 rounded-lg transition-colors ${
                              player.status === 'suspended' 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            }`}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
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
              <div className="text-white/60">{games.length} total games</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Game</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Players</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Entry Fee</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Prize Pool</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Status</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Created</th>
                    <th className="text-left text-white/80 font-semibold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
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
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(game.status || 'waiting')}`}>
                          {getStatusIcon(game.status || 'waiting')}
                          <span>{game.status || 'Waiting'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80">{formatDate(game.createdAt)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
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

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-8 h-8 text-purple-400" />
                <span>Transactions</span>
              </h2>
              <div className="text-white/60">{transactions.length} total transactions</div>
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
                  {transactions.slice(0, 20).map((txn) => (
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
                          ['deposit', 'win'].includes(txn.type) ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {['deposit', 'win'].includes(txn.type) ? '+' : '-'}{formatCurrency(txn.amount || 0)}
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
      </div>
    </div>
  );
};

export default AdminPage;