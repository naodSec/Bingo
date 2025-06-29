import React, { useState } from 'react';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';
import axios from 'axios';

interface WithdrawalModalProps {
  onClose: () => void;
  wallet: any;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ onClose, wallet }) => {
  const [amount, setAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleWithdrawal = async () => {
    if (!auth.currentUser || !amount || !phoneNumber) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    if (withdrawalAmount < 50) {
      toast.error('Minimum withdrawal amount is 50 ETB.');
      return;
    }

    if (withdrawalAmount > wallet?.balance) {
      toast.error('Insufficient balance.');
      return;
    }

    if (phoneNumber.length !== 9) {
      toast.error('Invalid phone number. Enter exactly 9 digits after +251.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: auth.currentUser.uid,
        amount: withdrawalAmount,
        phone: `+251${phoneNumber}`, // Add +251 prefix
      };

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/withdraw`, payload);

      if (res.data.success) {
        toast.success('Withdrawal request submitted successfully.');
        onClose(); // Close the modal
      } else {
        throw new Error(res.data.error || 'Withdrawal failed.');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);

      // Handle Axios-specific errors
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        toast.error(error.response.data?.error || 'Server error. Please try again.');
      } else if (error.request) {
        // Request was made but no response was received
        toast.error('No response from server. Please check your network connection.');
      } else {
        // Something else caused the error
        toast.error('An unexpected error occurred. Please try again.');
      }
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
          <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Available Balance */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">Available Balance</p>
            <p className="text-blue-400 text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Withdrawal Amount (ETB)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="50"
              max={wallet?.balance || 0}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-white/60 text-xs mt-1">
              Min: {formatCurrency(50)} - Available: {formatCurrency(wallet?.balance || 0)}
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Phone Number (for mobile money)
            </label>
            <div className="flex items-center">
              <span className="px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white/60">
                +251
              </span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                  if (input.length <= 9) {
                    setPhoneNumber(input);
                  }
                }}
                placeholder="912345678"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-r-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-white/60 text-xs mt-1">
              Format: +251 followed by 9 digits (e.g., +251912345678)
            </p>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-yellow-400 text-sm">
                <p className="font-semibold mb-1">Processing Time:</p>
                <p>Withdrawals are processed within 24 hours during business days.</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div className="text-orange-400 text-sm">
                <p className="font-semibold mb-1">Important:</p>
                <p>Please ensure your phone number is correct. Incorrect details may result in failed transfers.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleWithdrawal}
            disabled={loading || !amount || !phoneNumber || parseFloat(amount) < 50}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Submit Withdrawal Request</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;