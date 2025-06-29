import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  Users, 
  Gift, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Zap,
  Crown,
  Target,
  Sparkles,
  Play,
  Volume2,
  Globe
} from 'lucide-react';

interface WelcomePageProps {
  onComplete: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Epic Bingo!',
      subtitle: 'The Ultimate Gaming Experience',
      description: 'Experience the most advanced multiplayer bingo with cutting-edge features',
      icon: Trophy,
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      features: [
        { text: 'Real-time multiplayer gameplay', icon: Users },
        { text: 'Multi-language voice announcements', icon: Volume2 },
        { text: 'Telegram bot integration', icon: Globe },
        { text: 'Secure wallet & instant payouts', icon: Gift }
      ]
    },
    {
      title: 'Master the Game',
      subtitle: 'Learn Like a Pro',
      description: 'Discover the strategies that separate winners from players',
      icon: Gamepad2,
      gradient: 'from-blue-400 via-purple-500 to-pink-500',
      features: [
        { text: 'Join or create premium game rooms', icon: Crown },
        { text: 'Mark numbers with precision timing', icon: Target },
        { text: 'Complete winning patterns first', icon: Star },
        { text: 'Claim massive prize pools', icon: Trophy }
      ]
    },
    {
      title: 'Winning Patterns',
      subtitle: 'Your Path to Victory',
      description: 'Multiple ways to dominate and claim your rewards',
      icon: Star,
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      features: [
        { text: 'Horizontal Line: Complete any row', icon: Zap },
        { text: 'Vertical Line: Complete any column', icon: Zap },
        { text: 'Diagonal Line: Corner to corner', icon: Zap },
        { text: 'Full House: Mark every number', icon: Crown }
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('welcomeCompleted', 'true');
      onComplete();
    }
  };

  const skip = () => {
    localStorage.setItem('welcomeCompleted', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-yellow-500/10 rounded-full animate-bounce"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-3">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`relative transition-all duration-500 ${
                    index <= currentStep ? 'w-12 h-3' : 'w-3 h-3'
                  } rounded-full ${
                    index <= currentStep 
                      ? `bg-gradient-to-r ${currentStepData.gradient}` 
                      : 'bg-white/20'
                  }`}
                >
                  {index <= currentStep && (
                    <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentStepData.gradient} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
            
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
              </div>

              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`relative p-6 rounded-full bg-gradient-to-r ${currentStepData.gradient} shadow-2xl transform transition-all duration-500 hover:scale-110`}>
                    <IconComponent className="w-16 h-16 text-white" />
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                    
                    {/* Sparkle effects */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title and Subtitle */}
                <div className="mb-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {currentStepData.title}
                  </h1>
                  <p className={`text-xl md:text-2xl font-semibold bg-gradient-to-r ${currentStepData.gradient} bg-clip-text text-transparent mb-4`}>
                    {currentStepData.subtitle}
                  </p>
                  <p className="text-white/80 text-lg max-w-2xl mx-auto">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
                  {currentStepData.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div 
                        key={index}
                        className="group bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/30"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${currentStepData.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                            <FeatureIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-white/90 font-semibold text-lg group-hover:text-white transition-colors">
                              {feature.text}
                            </span>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={skip}
                    className="text-white/60 hover:text-white transition-all duration-300 font-semibold px-6 py-3 rounded-xl hover:bg-white/10"
                  >
                    Skip Tutorial
                  </button>

                  <div className="flex items-center space-x-4">
                    {/* Step indicator */}
                    <div className="text-white/60 text-sm font-medium">
                      {currentStep + 1} of {steps.length}
                    </div>

                    <button
                      onClick={nextStep}
                      className={`group bg-gradient-to-r ${currentStepData.gradient} hover:shadow-2xl text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg`}
                    >
                      <span className="text-lg">
                        {currentStep === steps.length - 1 ? 'Start Gaming' : 'Continue'}
                      </span>
                      {currentStep === steps.length - 1 ? (
                        <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                      ) : (
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-8 space-x-8">
            {[
              { icon: Trophy, label: 'Win Big', color: 'text-yellow-400' },
              { icon: Users, label: 'Play Together', color: 'text-blue-400' },
              { icon: Zap, label: 'Fast Action', color: 'text-purple-400' }
            ].map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div 
                  key={index}
                  className="text-center group cursor-pointer"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`${item.color} mb-2 transform group-hover:scale-110 transition-transform duration-300`}>
                    <ItemIcon className="w-8 h-8 mx-auto" />
                  </div>
                  <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;