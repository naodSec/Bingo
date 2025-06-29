import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Trophy, 
  RefreshCw,
  Gift,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Gamepad2,
  Zap,
  Star,
  Filter,
  Download,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Transaction } from '../types/wallet';
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";

interface TransactionHistoryProps {
  userId: string;
  transactions?: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId, transactions: propTransactions }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(propTransactions || []);
  const [loading, setLoading] = useState(!propTransactions);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'bet' | 'win'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (propTransactions) {
      setTransactions(propTransactions);
      setLoading(false);
      return;
    }

    if (!userId) return;

    setLoading(true);
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date()
      })) as Transaction[];
      setTransactions(txns);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, propTransactions]);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5" />;
      case 'bet': return <Gamepad2 className="w-5 h-5" />;
      case 'win': return <Trophy className="w-5 h-5" />;
      case 'refund': return <RefreshCw className="w-5 h-5" />;
      case 'bonus': return <Gift className="w-5 h-5" />;
      case 'fee': return <DollarSign className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'from-green-500 to-emerald-600';
      case 'withdrawal': return 'from-red-500 to-pink-600';
      case 'bet': return 'from-blue-500 to-indigo-600';
      case 'win': return 'from-yellow-500 to-orange-600';
      case 'refund': return 'from-purple-500 to-violet-600';
      case 'bonus': return 'from-pink-500 to-rose-600';
      case 'fee': return 'from-gray-500 to-slate-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'processing': return 'text-blue-400 bg-blue-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'cancelled': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'refund':
      case 'bonus':
        return 'text-green-400';
      case 'withdrawal':
      case 'bet':
      case 'fee':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'refund':
      case 'bonus':
        return '+';
      case 'withdrawal':
      case 'bet':
      case 'fee':
        return '-';
      default:
        return '';
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
    
    let d: Date;
    if (date?.toDate) {
      d = date.toDate();
    } else if (date?.seconds) {
      d = new Date(date.seconds * 1000);
    } else {
      d = new Date(date);
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.metadata?.gameId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(tx => {
        let txDate: Date;
        if (tx.createdAt?.toDate) {
          txDate = tx.createdAt.toDate();
        } else if (tx.createdAt?.seconds) {
          txDate = new Date(tx.createdAt.seconds * 1000);
        } else {
          txDate = new Date(tx.createdAt);
        }

        switch (dateFilter) {
          case 'today': return txDate >= today;
          case 'week': return txDate >= weekAgo;
          case 'month': return txDate >= monthAgo;
          default: return true;
        }
      });
    }

    return filtered;
  };

  const filteredTransactions = filterTransactions();

  const getTransactionStats = () => {
    const stats = {
      totalIn: 0,
      totalOut: 0,
      totalTransactions: filteredTransactions.length,
      pendingCount: 0
    };

    filteredTransactions.forEach(tx => {
      if (tx.status === 'completed') {
        if (['deposit', 'win', 'refund', 'bonus'].includes(tx.type)) {
          stats.totalIn += tx.amount;
        } else if (['withdrawal', 'bet', 'fee'].includes(tx.type)) {
          stats.totalOut += tx.amount;
        }
      }
      if (tx.status === 'pending') {
        stats.pendingCount++;
      }
    });

    return stats;
  };

  const stats = getTransactionStats();

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'Description'].join(','),
      ...filteredTransactions.map(tx => [
        formatDate(tx.createdAt),
        tx.type,
        tx.amount,
        tx.status,
        tx.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-white/10 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-semibold">Total In</p>
              <p className="text-white text-xl font-bold">{formatCurrency(stats.totalIn)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm font-semibold">Total Out</p>
              <p className="text-white text-xl font-bold">{formatCurrency(stats.totalOut)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-semibold">Net Flow</p>
              <p className={`text-xl font-bold ${stats.totalIn - stats.totalOut >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(stats.totalIn - stats.totalOut)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-semibold">Pending</p>
              <p className="text-white text-xl font-bold">{stats.pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                showFilters ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/60 text-sm">{filteredTransactions.length} transactions</span>
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-2 rounded-lg font-semibold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">Transaction Type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Types</option>
                  <option value="deposit" className="bg-gray-800">Deposits</option>
                  <option value="withdrawal" className="bg-gray-800">Withdrawals</option>
                  <option value="bet" className="bg-gray-800">Bets</option>
                  <option value="win" className="bg-gray-800">Wins</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">Time Period</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-gray-800">All Time</option>
                  <option value="today" className="bg-gray-800">Today</option>
                  <option value="week" className="bg-gray-800">Last 7 Days</option>
                  <option value="month" className="bg-gray-800">Last 30 Days</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                    setDateFilter('all');
                  }}
                  className="w-full bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 px-3 py-2 rounded-lg font-semibold transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-12 h-12 text-white/40" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || filter !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Your gaming journey starts here! Make your first deposit to begin.'
            }
          </p>
          <div className="inline-flex items-center space-x-2 text-blue-400 text-sm">
            <Star className="w-4 h-4" />
            <span>Start playing to see your transaction history</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction, index) => (
            <div 
              key={transaction.id} 
              className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-white/20"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Transaction Icon */}
                  <div className={`relative p-3 rounded-xl bg-gradient-to-r ${getTransactionColor(transaction.type)} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {getTransactionIcon(transaction.type)}
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">
                        {capitalizeFirst(transaction.type)}
                      </h4>
                      
                      {/* Status Badge */}
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span>{capitalizeFirst(transaction.status)}</span>
                      </div>
                    </div>

                    <p className="text-white/70 text-sm mb-2 group-hover:text-white/90 transition-colors">
                      {transaction.description || `${capitalizeFirst(transaction.type)} transaction`}
                    </p>

                    {/* Transaction Meta */}
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-white/50">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>

                      {transaction.metadata?.gameId && (
                        <div className="flex items-center space-x-1 text-blue-400">
                          <Gamepad2 className="w-3 h-3" />
                          <span>Game: {transaction.metadata.gameId.slice(-6)}</span>
                        </div>
                      )}

                      {transaction.metadata?.chapaReference && (
                        <div className="flex items-center space-x-1 text-purple-400">
                          <CreditCard className="w-3 h-3" />
                          <span>Ref: {transaction.metadata.chapaReference.slice(-8)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className={`font-bold text-xl ${getAmountColor(transaction.type)} group-hover:scale-110 transition-transform duration-300`}>
                    {getAmountPrefix(transaction.type)}{formatCurrency(
                      transaction.metadata?.originalAmount || transaction.amount
                    )}
                  </div>

                  {transaction.metadata?.fee && transaction.metadata.fee > 0 && (
                    <div className="text-white/40 text-xs mt-1">
                      Fee: {formatCurrency(transaction.metadata.fee)}
                    </div>
                  )}

                  {/* Win multiplier for wins */}
                  {transaction.type === 'win' && transaction.metadata?.multiplier && (
                    <div className="text-yellow-400 text-xs font-bold mt-1 flex items-center justify-end space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{transaction.metadata.multiplier}x Win!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for pending transactions */}
              {transaction.status === 'pending' && (
                <div className="mt-3 w-full bg-white/10 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredTransactions.length >= 20 && (
        <div className="text-center pt-4">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;