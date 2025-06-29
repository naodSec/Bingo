import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Crown, 
  Trophy, 
  Star, 
  Target, 
  Gamepad2,
  Wallet,
  Settings,
  Camera,
  Shield,
  Zap,
  Gift,
  Edit3,
  Save,
  X
} from "lucide-react";

const ProfileSetup: React.FC<{ user: any; onComplete: () => void }> = ({ user, onComplete }) => {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [favoriteLanguage, setFavoriteLanguage] = useState("am-ET");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalWinnings: 0,
    currentStreak: 0,
    level: 1,
    experience: 0
  });

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || data.name || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
          setFavoriteLanguage(data.favoriteLanguage || "am-ET");
          setStats(data.stats || stats);
        } else {
          setEditMode(true); // New user, enable edit mode
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user.uid]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim()
      });

      // Update Firestore document
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
        name: displayName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        favoriteLanguage,
        email: user.email,
        stats,
        updatedAt: new Date(),
        createdAt: new Date() // Will only set if document doesn't exist
      }, { merge: true });

      toast.success("Profile updated successfully!");
      setEditMode(false);
      onComplete();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPlayerLevel = (experience: number) => {
    if (experience >= 10000) return { level: 'Grandmaster', icon: Crown, color: 'from-purple-400 to-pink-600', bgColor: 'bg-purple-500/20' };
    if (experience >= 5000) return { level: 'Master', icon: Trophy, color: 'from-yellow-400 to-orange-600', bgColor: 'bg-yellow-500/20' };
    if (experience >= 2000) return { level: 'Expert', icon: Star, color: 'from-blue-400 to-indigo-600', bgColor: 'bg-blue-500/20' };
    if (experience >= 500) return { level: 'Advanced', icon: Target, color: 'from-green-400 to-emerald-600', bgColor: 'bg-green-500/20' };
    return { level: 'Beginner', icon: Gamepad2, color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-500/20' };
  };

  const playerLevel = getPlayerLevel(stats.experience);
  const LevelIcon = playerLevel.icon;
  const winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Player Profile
              </span>
            </h1>
            <p className="text-white/80">Customize your gaming identity</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-2xl flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-800 relative overflow-hidden">
                      {/* Avatar Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                      
                      {/* User Initial */}
                      <span className="relative z-10 text-4xl font-bold text-white">
                        {(displayName || user.email || 'U')[0].toUpperCase()}
                      </span>
                      
                      {/* Level Badge */}
                      <div className={`absolute -bottom-2 -right-2 ${playerLevel.bgColor} border-2 border-white rounded-full px-3 py-1 flex items-center space-x-1`}>
                        <LevelIcon className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-bold">{stats.level}</span>
                      </div>
                    </div>
                    
                    {/* Camera Icon for Future Avatar Upload */}
                    <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Player Level */}
                  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${playerLevel.color} px-4 py-2 rounded-xl text-white font-bold shadow-lg mb-4`}>
                    <LevelIcon className="w-5 h-5" />
                    <span>{playerLevel.level}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-1">
                    {displayName || "Set Your Name"}
                  </h2>
                  <p className="text-white/60">{user.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{stats.gamesWon}</div>
                    <div className="text-white/60 text-xs">Wins</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{winRate}%</div>
                    <div className="text-white/60 text-xs">Win Rate</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Zap className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{stats.currentStreak}</div>
                    <div className="text-white/60 text-xs">Streak</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Gift className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{stats.totalWinnings.toLocaleString()}</div>
                    <div className="text-white/60 text-xs">ETB Won</div>
                  </div>
                </div>

                {/* Experience Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-white/80 text-sm mb-2">
                    <span>Experience</span>
                    <span>{stats.experience} XP</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.experience % 1000) / 10, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    {1000 - (stats.experience % 1000)} XP to next level
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <User className="w-6 h-6" />
                    <span>Profile Information</span>
                  </h3>
                  
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Display Name</span>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {displayName || "Not set"}
                      </div>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </label>
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60">
                      {user.email}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2 flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251911234567"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {phone || "Not set"}
                      </div>
                    )}
                  </div>

                  {/* Favorite Language */}
                  <div>
                    <label className="block text-white/80 text-sm font-semibold mb-2 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Preferred Language</span>
                    </label>
                    {editMode ? (
                      <select
                        value={favoriteLanguage}
                        onChange={(e) => setFavoriteLanguage(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="am-ET" className="bg-gray-800">አማርኛ (Amharic)</option>
                        <option value="ti-ET" className="bg-gray-800">ትግርኛ (Tigrinya)</option>
                        <option value="om-ET" className="bg-gray-800">Afaan Oromoo (Oromo)</option>
                        <option value="en-US" className="bg-gray-800">English</option>
                      </select>
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {favoriteLanguage === 'am-ET' ? 'አማርኛ (Amharic)' :
                         favoriteLanguage === 'ti-ET' ? 'ትግርኛ (Tigrinya)' :
                         favoriteLanguage === 'om-ET' ? 'Afaan Oromoo (Oromo)' : 'English'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <label className="block text-white/80 text-sm font-semibold mb-2 flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Bio</span>
                  </label>
                  {editMode ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell other players about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white min-h-[80px]">
                      {bio || "No bio set"}
                    </div>
                  )}
                </div>

                {/* Achievements Section */}
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span>Achievements</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'First Win', icon: Star, earned: stats.gamesWon > 0, description: 'Win your first game' },
                      { name: 'Hot Streak', icon: Zap, earned: stats.currentStreak >= 3, description: 'Win 3 games in a row' },
                      { name: 'Big Winner', icon: Crown, earned: stats.totalWinnings >= 1000, description: 'Win 1000+ ETB total' },
                      { name: 'Veteran', icon: Shield, earned: stats.gamesPlayed >= 50, description: 'Play 50+ games' }
                    ].map((achievement) => {
                      const AchievementIcon = achievement.icon;
                      return (
                        <div 
                          key={achievement.name}
                          className={`p-4 rounded-xl border transition-all ${
                            achievement.earned 
                              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' 
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                          title={achievement.description}
                        >
                          <AchievementIcon className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-center text-sm font-semibold">{achievement.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;