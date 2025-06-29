import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Trophy, 
  Target, 
  Users, 
  Gamepad2,
  Volume2,
  Wallet,
  Star,
  Zap,
  Crown,
  Gift,
  Sparkles,
  X,
  Eye,
  Hand,
  MousePointer
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  interactive?: boolean;
  action?: string;
  highlight?: string;
  tips?: string[];
}

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(true);
  const [userProgress, setUserProgress] = useState({
    hasClickedCard: false,
    hasSeenWinPattern: false,
    hasLearnedVoice: false,
    hasLearnedWallet: false
  });

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Epic Bingo! 🎯',
      description: 'Get ready for the most exciting multiplayer bingo experience! This interactive tutorial will teach you everything you need to dominate the game.',
      icon: Trophy,
      tips: [
        'Complete all steps to become a bingo master',
        'You can skip anytime, but we recommend finishing',
        'Each step builds on the previous one'
      ]
    },
    {
      id: 'game-basics',
      title: 'How Bingo Works',
      description: 'Bingo is simple: mark numbers on your card as they\'re called. Be the first to complete a winning pattern and shout "BINGO!" to win the prize pool.',
      icon: Gamepad2,
      interactive: true,
      action: 'Click the demo bingo card below to practice marking numbers',
      highlight: 'bingo-card-demo',
      tips: [
        'Numbers are called randomly from 1-75',
        'Each column has a specific range: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)',
        'The center square is always FREE and pre-marked'
      ]
    },
    {
      id: 'winning-patterns',
      title: 'Winning Patterns 🏆',
      description: 'Learn the different ways to win! Each pattern has different prize values.',
      icon: Target,
      interactive: true,
      action: 'Click on the pattern examples to see how they work',
      highlight: 'pattern-examples',
      tips: [
        'Line wins: Any row, column, or diagonal',
        'Four corners: Mark all corner squares',
        'Full house: Mark every number (biggest prize!)',
        'Special patterns: Center cross, edge pattern'
      ]
    },
    {
      id: 'voice-features',
      title: 'Multi-Language Voice 🗣️',
      description: 'Our advanced voice system announces numbers in Amharic, Tigrinya, Oromo, and English. Never miss a call!',
      icon: Volume2,
      interactive: true,
      action: 'Test the voice announcement system',
      highlight: 'voice-demo',
      tips: [
        'Choose your preferred language',
        'Adjust speed and volume to your liking',
        'Voice works even when the app is in background',
        'Perfect for accessibility and multitasking'
      ]
    },
    {
      id: 'wallet-system',
      title: 'Secure Wallet System 💰',
      description: 'Manage your funds safely with our integrated wallet. Deposit, withdraw, and track all your transactions.',
      icon: Wallet,
      interactive: true,
      action: 'Explore wallet features',
      highlight: 'wallet-demo',
      tips: [
        'Instant deposits via Chapa payment gateway',
        'Fast withdrawals to mobile money',
        'Real-time balance updates',
        'Complete transaction history'
      ]
    },
    {
      id: 'game-types',
      title: 'Game Modes & Strategy 🎮',
      description: 'Choose from different game types and learn winning strategies.',
      icon: Crown,
      tips: [
        'Free games: Practice without risk',
        'Premium games: Higher stakes, bigger prizes',
        'Tournament mode: Compete against the best',
        'Speed bingo: Fast-paced action'
      ]
    },
    {
      id: 'social-features',
      title: 'Social Gaming 👥',
      description: 'Connect with friends, join communities, and compete in leaderboards.',
      icon: Users,
      tips: [
        'Telegram bot integration for notifications',
        'Create private rooms for friends',
        'Join public tournaments',
        'Chat with other players'
      ]
    },
    {
      id: 'ready-to-play',
      title: 'You\'re Ready to Win! 🚀',
      description: 'Congratulations! You\'ve mastered the basics. Time to put your skills to the test and win some prizes!',
      icon: Sparkles,
      tips: [
        'Start with free games to practice',
        'Watch for special promotions',
        'Join our community for tips and tricks',
        'Remember: have fun and play responsibly!'
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    localStorage.setItem('tutorialCompleted', 'true');
    localStorage.setItem('tutorialProgress', JSON.stringify({
      completed: true,
      completedAt: new Date().toISOString(),
      stepsCompleted: tutorialSteps.length
    }));
    onComplete();
  };

  const skipTutorial = () => {
    localStorage.setItem('tutorialSkipped', 'true');
    onSkip();
  };

  const currentStepData = tutorialSteps[currentStep];
  const IconComponent = currentStepData.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  // Demo components for interactive steps
  const DemoBingoCard = () => {
    const [markedCells, setMarkedCells] = useState<Set<string>>(new Set(['N-2'])); // Free space

    const handleCellClick = (column: string, row: number) => {
      const cellId = `${column}-${row}`;
      setMarkedCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cellId)) {
          newSet.delete(cellId);
        } else {
          newSet.add(cellId);
        }
        return newSet;
      });
      
      if (!userProgress.hasClickedCard) {
        setUserProgress(prev => ({ ...prev, hasClickedCard: true }));
      }
    };

    const columns = ['B', 'I', 'N', 'G', 'O'];
    const generateNumber = (col: string, row: number) => {
      if (col === 'N' && row === 2) return 'FREE';
      const ranges = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };
      const [min, max] = ranges[col as keyof typeof ranges];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {columns.map(col => (
            <div key={col} className="bg-blue-600 text-white text-center py-2 rounded font-bold">
              {col}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const row = Math.floor(i / 5);
            const col = columns[i % 5];
            const cellId = `${col}-${row}`;
            const isMarked = markedCells.has(cellId);
            const number = generateNumber(col, row);
            
            return (
              <button
                key={cellId}
                onClick={() => handleCellClick(col, row)}
                className={`aspect-square flex items-center justify-center rounded text-sm font-bold transition-all duration-200 ${
                  isMarked 
                    ? 'bg-green-500 text-white transform scale-105' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                } ${col === 'N' && row === 2 ? 'bg-yellow-500 text-white' : ''}`}
              >
                {number}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-center">
          <p className="text-white/80 text-sm">
            {userProgress.hasClickedCard ? (
              <span className="text-green-400 flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Great! You've learned to mark numbers!</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-1">
                <MousePointer className="w-4 h-4" />
                <span>Click any number to mark it</span>
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  const PatternExamples = () => {
    const patterns = [
      { name: 'Horizontal Line', description: 'Complete any row', icon: '━━━━━' },
      { name: 'Vertical Line', description: 'Complete any column', icon: '┃' },
      { name: 'Diagonal', description: 'Corner to corner', icon: '╲ ╱' },
      { name: 'Four Corners', description: 'All corner squares', icon: '┌ ┐\n└ ┘' },
      { name: 'Full House', description: 'Every number marked', icon: '████' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pattern, index) => (
          <div 
            key={pattern.name}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => setUserProgress(prev => ({ ...prev, hasSeenWinPattern: true }))}
          >
            <div className="text-center">
              <div className="text-2xl font-mono mb-2 text-yellow-400">{pattern.icon}</div>
              <h4 className="text-white font-bold">{pattern.name}</h4>
              <p className="text-white/70 text-sm">{pattern.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const VoiceDemo = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playDemo = () => {
      setIsPlaying(true);
      setUserProgress(prev => ({ ...prev, hasLearnedVoice: true }));
      
      // Simulate voice announcement
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000);
    };

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
        <div className="mb-4">
          <Volume2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h4 className="text-white font-bold text-lg mb-2">Multi-Language Voice System</h4>
          <p className="text-white/70">Experience announcements in your preferred language</p>
        </div>
        
        <button
          onClick={playDemo}
          disabled={isPlaying}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50"
        >
          {isPlaying ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Playing Demo...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Test Voice Announcement</span>
            </span>
          )}
        </button>

        {userProgress.hasLearnedVoice && (
          <div className="mt-4 text-green-400 flex items-center justify-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Voice system tested!</span>
          </div>
        )}
      </div>
    );
  };

  const WalletDemo = () => {
    const [balance] = useState(1250.75);

    useEffect(() => {
      setUserProgress(prev => ({ ...prev, hasLearnedWallet: true }));
    }, []);

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center mb-4">
          <Wallet className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h4 className="text-white font-bold text-lg mb-2">Your Gaming Wallet</h4>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 mb-4">
          <div className="text-center">
            <p className="text-white/80 text-sm">Current Balance</p>
            <p className="text-green-400 text-3xl font-bold">{balance.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 px-4 rounded-lg font-semibold transition-all">
            Deposit
          </button>
          <button className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 px-4 rounded-lg font-semibold transition-all">
            Withdraw
          </button>
        </div>

        <div className="mt-4 text-center">
          <div className="text-green-400 flex items-center justify-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Wallet system explored!</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
              <p className="text-white/60">Step {currentStep + 1} of {tutorialSteps.length}</p>
            </div>
          </div>
          
          <button
            onClick={skipTutorial}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-white/60 text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-white/90 text-lg mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Interactive Content */}
          {currentStepData.interactive && (
            <div className="mb-6">
              {currentStepData.action && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Hand className="w-5 h-5" />
                    <span className="font-semibold">Try it yourself:</span>
                  </div>
                  <p className="text-white/80 mt-1">{currentStepData.action}</p>
                </div>
              )}

              {currentStep === 1 && <DemoBingoCard />}
              {currentStep === 2 && <PatternExamples />}
              {currentStep === 3 && <VoiceDemo />}
              {currentStep === 4 && <WalletDemo />}
            </div>
          )}

          {/* Tips */}
          {currentStepData.tips && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-yellow-400 mb-3">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Pro Tips:</span>
              </div>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="text-white/80 flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-500 scale-125'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            <span>{currentStep === tutorialSteps.length - 1 ? 'Start Playing!' : 'Next'}</span>
            {currentStep === tutorialSteps.length - 1 ? (
              <Play className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            onClick={skipTutorial}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            Skip tutorial and start playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTutorial;