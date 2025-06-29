import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Settings,
  Plus,
  Minus,
  Eye,
  EyeOff,
  TrendingUp,
  Shield,
  ArrowLeft,
  Zap,
  Star,
  Trophy,
  Target,
  Gamepad2,
  Crown,
  Sparkles
} from 'lucide-react';
import { auth } from '../firebase/config';
import { walletService } from '../services/walletService';
import { Wallet as WalletType, Transaction, PaymentMethod } from '../types/wallet';
import DepositModal from './DepositModal';
import WithdrawalModal from './WithdrawalModal';
import TransactionHistory from './TransactionHistory';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface WalletPageProps {
  user: any;
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ user, onNavigate, onBack }) => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balanceAnimation, setBalanceAnimation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.currentUser?.uid) {
      setLoading(false);
      return;
    }

    if (!walletService || typeof walletService.subscribeToWallet !== 'function') {
      console.error('WalletService not properly imported');
      setLoading(false);
      return;
    }

    const unsubscribeWallet = walletService.subscribeToWallet(
      auth.currentUser.uid,
      (walletData) => {
        const prevBalance = wallet?.balance || 0;
        setWallet(walletData);
        setLoading(false);
        
        // Trigger balance animation if balance changed
        if (walletData && prevBalance !== walletData.balance) {
          setBalanceAnimation(true);
          setTimeout(() => setBalanceAnimation(false), 1000);
        }
      }
    );

    const unsubscribeTransactions = walletService.subscribeToTransactions(
      auth.currentUser.uid,
      setTransactions
    );

    return () => {
      if (typeof unsubscribeWallet === 'function') unsubscribeWallet();
      if (typeof unsubscribeTransactions === 'function') unsubscribeTransactions();
    };
  }, [wallet?.balance, auth.currentUser?.uid]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("deposit") === "success") {
      toast.success("Deposit successful! 🎉");
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
    }
  }, [location, onBack]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?.uid) return;
  
      try {
        const walletData = await walletService.getWallet(user.uid);
        setWallet(walletData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet:', error);
        toast.error('Failed to load wallet details.');
        setLoading(false);
      }
    };
  
    fetchWallet();
  }, [user?.uid, location]); // Add `location` to re-fetch wallet data after redirection

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const getRecentStats = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTransactions = transactions.filter(t => {
      if (!t.createdAt) return false;
      let date: Date;
      if (t.createdAt?.toDate) {
        date = t.createdAt.toDate();
      } else if (t.createdAt?.seconds) {
        date = new Date(t.createdAt.seconds * 1000);
      } else {
        date = new Date(t.createdAt);
      }
      return date >= lastWeek;
    });

    const deposits = recentTransactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.metadata?.originalAmount || t.amount), 0);

    const withdrawals = recentTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.metadata?.originalAmount || t.amount), 0);

    const bets = recentTransactions
      .filter(t => t.type === 'bet')
      .reduce((sum, t) => sum + t.amount, 0);

    const wins = recentTransactions
      .filter(t => t.type === 'win')
      .reduce((sum, t) => sum + t.amount, 0);

    return { deposits, withdrawals, bets, wins, totalTransactions: recentTransactions.length };
  };

  const getWalletLevel = (balance: number) => {
    if (balance >= 10000) return { level: 'Diamond', color: 'from-cyan-400 to-blue-600', icon: Crown };
    if (balance >= 5000) return { level: 'Gold', color: 'from-yellow-400 to-orange-600', icon: Trophy };
    if (balance >= 1000) return { level: 'Silver', color: 'from-gray-300 to-gray-600', icon: Star };
    return { level: 'Bronze', color: 'from-orange-400 to-red-600', icon: Target };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading your wallet...</div>
          <div className="text-white/60 text-sm mt-2">Preparing your gaming experience</div>
        </div>
      </div>
    );
  }

  const stats = getRecentStats();
  const walletLevel = getWalletLevel(wallet?.balance || 0);
  const LevelIcon = walletLevel.icon;

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Gaming Wallet
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${walletLevel.color}`}>
                    <LevelIcon className="w-6 h-6 text-white" />
                  </div>
                </h1>
                <p className="text-white/80 flex items-center space-x-2">
                  <span>Manage your gaming funds</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{walletLevel.level} Player</span>
                </p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Balance Card */}
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-3xl p-8 backdrop-blur-sm border border-white/20 overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-white/80 text-lg font-medium">Available Balance</p>
                          <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-white text-xs font-semibold">Secured</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <h2 className={`text-5xl font-bold text-white transition-all duration-500 ${balanceAnimation ? 'scale-110 text-yellow-400' : ''}`}>
                            {showBalance ? formatCurrency(wallet?.balance || 0) : '••••••'}
                          </h2>
                          <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10"
                          >
                            {showBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                          </button>
                          {balanceAnimation && (
                            <div className="flex items-center space-x-1 text-yellow-400 animate-bounce">
                              <Sparkles className="w-5 h-5" />
                              <span className="text-sm font-semibold">Updated!</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${walletLevel.color} px-4 py-2 rounded-xl text-white font-bold shadow-lg`}>
                          <LevelIcon className="w-5 h-5" />
                          <span>{walletLevel.level}</span>
                        </div>
                        <p className="text-white/60 text-sm mt-2">
                          Status: {wallet?.status || 'Active'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowDepositModal(true)}
                        className="group bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-3 border border-white/20 hover:border-white/40"
                      >
                        <div className="p-2 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-lg">Deposit</span>
                      </button>
                      <button
                        onClick={() => setShowWithdrawalModal(true)}
                        className="group bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-3 border border-white/20 hover:border-white/40"
                      >
                        <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
                          <Minus className="w-6 h-6" />
                        </div>
                        <span className="text-lg">Withdraw</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { 
                    title: 'Deposits', 
                    value: stats.deposits, 
                    icon: ArrowDownLeft, 
                    color: 'from-green-500 to-emerald-600',
                    bgColor: 'bg-green-500/20',
                    change: '+12%'
                  },
                  { 
                    title: 'Withdrawals', 
                    value: stats.withdrawals, 
                    icon: ArrowUpRight, 
                    color: 'from-red-500 to-pink-600',
                    bgColor: 'bg-red-500/20',
                    change: '-5%'
                  },
                  { 
                    title: 'Bets Placed', 
                    value: stats.bets, 
                    icon: Gamepad2, 
                    color: 'from-blue-500 to-indigo-600',
                    bgColor: 'bg-blue-500/20',
                    change: '+25%'
                  },
                  { 
                    title: 'Winnings', 
                    value: stats.wins, 
                    icon: Trophy, 
                    color: 'from-yellow-500 to-orange-600',
                    bgColor: 'bg-yellow-500/20',
                    change: '+18%'
                  }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div 
                      key={stat.title}
                      className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-1 text-green-400 text-sm font-semibold">
                          <TrendingUp className="w-4 h-4" />
                          <span>{stat.change}</span>
                        </div>
                      </div>
                      <h3 className="text-white text-lg font-semibold mb-1">{stat.title}</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        {formatCurrency(stat.value)}
                      </p>
                      <p className="text-white/60 text-sm mt-1">Last 7 days</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span>Quick Actions</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Play Bingo', icon: Gamepad2, action: () => navigate('/') },
                    { label: 'View Profile', icon: Settings, action: () => navigate('/profile') },
                    { label: 'Transaction History', icon: History, action: () => setActiveTab('history') },
                    { label: 'Support', icon: Shield, action: () => {} }
                  ].map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={action.action}
                        className="group bg-white/5 hover:bg-white/15 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/30"
                      >
                        <IconComponent className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:text-blue-300 transition-colors" />
                        <span className="text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
                          {action.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <History className="w-8 h-8 text-blue-400" />
                  <span>Transaction History</span>
                </h3>
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">{transactions.length} transactions</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              </div>

              <TransactionHistory userId={auth.currentUser?.uid || ''} transactions={transactions} />
            </div>
          )}

          {/* Modals */}
          {showDepositModal && (
            <DepositModal
              onClose={() => setShowDepositModal(false)}
              wallet={wallet}
            />
          )}

          {showWithdrawalModal && (
            <WithdrawalModal
              onClose={() => setShowWithdrawalModal(false)}
              wallet={wallet}
            />
          )}

          {/* Back to Menu Button */}
          <div className="mt-8">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">Back to Gaming Hub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;