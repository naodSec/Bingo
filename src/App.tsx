import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { auth } from './firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import GameLobby from './components/GameLobby';
import GameRoom from './components/GameRoom';
import AuthPage from './components/AuthPage';
import PaymentPage from './components/PaymentPage';
import WalletPage from './components/WalletPage';
import GameList from './components/GameList';
import { GameProvider } from './contexts/GameContext';
import WelcomePage from './components/WelcomePage';
import ProfileSetup from './components/ProfileSetup';
import InteractiveTutorial from './components/InteractiveTutorial';
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";
import AdminPage from './components/AdminPage';

const ADMIN_UIDS = [
  "YlXEWXPLKvMiWHdqRajvNzzpW883"
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGameList, setShowGameList] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        // Check if user needs to see welcome page
        if (!localStorage.getItem('welcomeCompleted')) {
          setShowWelcome(true);
        }
        // Check if user needs to see tutorial
        else if (!localStorage.getItem('tutorialCompleted') && !localStorage.getItem('tutorialSkipped')) {
          setShowTutorial(true);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(docSnap => {
        setProfileComplete(docSnap.exists());
      });
    }
  }, [user]);

  // Handler for selecting a game from GameList
  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setShowGameList(false);
  };
  
  const handleBackToMenu = () => {
    setShowGameList(false);
  }

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Show tutorial after welcome if not completed
    if (!localStorage.getItem('tutorialCompleted') && !localStorage.getItem('tutorialSkipped')) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <AuthPage />
        <Toaster position="top-right" />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <WelcomePage onComplete={handleWelcomeComplete} />
        <Toaster position="top-right" />
      </div>
    );
  }

  if (showTutorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <InteractiveTutorial 
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
        <Toaster position="top-right" />
      </div>
    );
  }

  if (profileComplete === false) {
    return (
      <ProfileSetup user={user} onComplete={() => setProfileComplete(true)} />
    );
  }

  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? (
                  showGameList ? (
                    <GameList
                     onSelectGame={handleSelectGame}
                     onBack={handleBackToMenu} />
                  ) : selectedGameId ? (
                    <Navigate to={`/game/${selectedGameId}`} />
                  ) : (
                    <GameLobby onShowGameList={() => setShowGameList(true)} />
                  )
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route 
              path="/auth" 
              element={!user ? <AuthPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/game/:gameId" 
              element={user ? <GameRoom /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/payment/:gameId" 
              element={user ? <PaymentPage /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/wallet" 
              element={user ? <WalletPage user={user} onNavigate={() => {}} /> : <Navigate to="/auth" />} 
            />
            <Route
              path="/admin"
              element={
                user && ADMIN_UIDS.includes(user.uid)
                  ? <AdminPage />
                  : <Navigate to="/" />
              }
            />
            <Route
              path="/profile"
              element={user ? <ProfileSetup user={user} onComplete={() => {}} /> : <Navigate to="/auth" />}
            />
            <Route
              path="/tutorial"
              element={
                user ? (
                  <InteractiveTutorial 
                    onComplete={() => window.history.back()}
                    onSkip={() => window.history.back()}
                  />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;