import React, { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';
import axios from "axios";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from 'react-router-dom';

interface DepositModalProps {
  onClose: () => void;
  wallet: { balance: number };
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: any;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, wallet }) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId) // Only fetch current user's transactions
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      setTransactions(txns);
    });

    return () => unsubscribe();
  }, []);

  const handleDeposit = async () => {
    if (!auth.currentUser || !amount) {
      toast.error('Please enter a valid amount.');
      return;
    }
  
    const userId = auth.currentUser.uid;
    const depositAmount = parseFloat(amount);
  
    if (depositAmount < 10) {
      toast.error('Minimum deposit amount is 10 ETB.');
      return;
    }
  
    if (depositAmount > 50000) {
      toast.error('Maximum deposit amount is 50,000 ETB.');
      return;
    }
  
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const phone = userDoc.exists() ? userDoc.data().phone : '';
      const email = auth.currentUser.email;
      const displayName = auth.currentUser.displayName || '';
      const first_name = displayName.split(' ')[0] || 'User';
      const last_name = displayName.split(' ')[1] || 'Player';
  
      if (!phone || !email) {
        toast.error('Missing phone or email in your profile.');
        setLoading(false);
        return;
      }
  
      const depositPayload = {
        amount: depositAmount,
        email,
        first_name,
        last_name,
        phone,
        userId
      };
  
      const res = await axios.post('/api/wallet/deposit', depositPayload);
  
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        throw new Error('Failed to get checkout URL.');
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Deposit Funds</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">Current Balance</p>
            <p className="text-blue-400 text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Deposit Amount (ETB)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="10"
              max="50000"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-white/60 text-xs mt-1">
              Min: {formatCurrency(10)} - Max: {formatCurrency(50000)}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
              >
                {formatCurrency(quickAmount)}
              </button>
            ))}
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-yellow-400 text-sm">
                <p className="font-semibold mb-1">Payment Method:</p>
                <p>You will be redirected to Chapa to complete the payment securely.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={loading || !amount || parseFloat(amount) < 10}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Deposit via Chapa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;