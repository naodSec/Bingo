import React, { useState } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  X, 
  HelpCircle,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  Headphones
} from 'lucide-react';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

interface SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportPanel: React.FC<SupportPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'contact'>('chat');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      // Simulate sending message to support
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    {
      question: 'How do I deposit money into my wallet?',
      answer: 'Go to your wallet page and click "Deposit". You can use Chapa payment gateway to add funds securely. Minimum deposit is 10 ETB.',
      category: 'payments'
    },
    {
      question: 'How long do withdrawals take?',
      answer: 'Withdrawals are processed within 24 hours during business days. You\'ll receive funds directly to your mobile money account.',
      category: 'payments'
    },
    {
      question: 'What are the different winning patterns?',
      answer: 'You can win with: Horizontal lines, Vertical lines, Diagonal lines, Four corners, Center cross, or Full house (all numbers marked).',
      category: 'gameplay'
    },
    {
      question: 'Can I play in my local language?',
      answer: 'Yes! We support Amharic, Tigrinya, Oromo, and English with full voice announcements in each language.',
      category: 'features'
    },
    {
      question: 'Is my money safe?',
      answer: 'Absolutely! We use bank-level security, encrypted transactions, and secure payment gateways. Your funds are protected.',
      category: 'security'
    },
    {
      question: 'How do I create a private game?',
      answer: 'Click "Create Game" in the lobby, set your preferences, and share the game ID with friends. You can set entry fees and player limits.',
      category: 'gameplay'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Support Center</h2>
              <p className="text-white/60">We're here to help you 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/20">
          {[
            { id: 'chat', label: 'Live Chat', icon: MessageCircle },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'contact', label: 'Contact Info', icon: Phone }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Support is Online</span>
                </div>
                <p className="text-white/80 text-sm">
                  Our support team is available 24/7. Average response time: 5 minutes
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general" className="bg-gray-800">General Question</option>
                  <option value="payments" className="bg-gray-800">Payments & Wallet</option>
                  <option value="gameplay" className="bg-gray-800">Gameplay Help</option>
                  <option value="technical" className="bg-gray-800">Technical Issue</option>
                  <option value="account" className="bg-gray-800">Account Problem</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={loading || !message.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Logged in as:</span>
                </div>
                <p className="text-white/80">{auth.currentUser?.email}</p>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Frequently Asked Questions</h3>
                <p className="text-white/60">Find quick answers to common questions</p>
              </div>

              {faqItems.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">{item.question}</h4>
                      <p className="text-white/80 text-sm leading-relaxed">{item.answer}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-semibold">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Get in Touch</h3>
                <p className="text-white/60">Multiple ways to reach our support team</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <MessageCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Live Chat</h4>
                      <p className="text-white/60 text-sm">Instant support</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Get immediate help from our support team. Available 24/7 with average response time of 5 minutes.
                  </p>
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Online Now</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Email Support</h4>
                      <p className="text-white/60 text-sm">Detailed assistance</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Send us detailed questions or issues. We respond within 2 hours during business hours.
                  </p>
                  <a 
                    href="mailto:support@bingogame.et" 
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                  >
                    support@bingogame.et
                  </a>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Phone className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Phone Support</h4>
                      <p className="text-white/60 text-sm">Voice assistance</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Call us for urgent issues or complex problems. Available Monday-Friday, 9 AM - 6 PM EAT.
                  </p>
                  <a 
                    href="tel:+251911234567" 
                    className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
                  >
                    +251 911 234 567
                  </a>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Business Hours</h4>
                      <p className="text-white/60 text-sm">When we're available</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Saturday:</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Sunday:</span>
                      <span>Chat support only</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Emergency Support</span>
                </div>
                <p className="text-white/80 text-sm">
                  For urgent payment or security issues, use live chat for immediate assistance even outside business hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPanel;