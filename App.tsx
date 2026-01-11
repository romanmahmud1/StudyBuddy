
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Languages, 
  MessageSquare, 
  MessageCircle, 
  Trophy, 
  Calculator, 
  HelpCircle, 
  ArrowLeft,
  ShieldCheck,
  Send,
  Mic,
  Camera,
  Settings,
  Star,
  Zap,
  Award,
  Mail,
  Heart,
  TrendingUp,
  Clock,
  Volume2,
  RefreshCw,
  ArrowRightLeft,
  Copy,
  Check,
  LayoutDashboard,
  Database,
  Users,
  Search,
  Type,
  X,
  Crop,
  Megaphone,
  Bell,
  Trash2,
  CircleCheck,
  ExternalLink,
  PlusCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Maximize,
  UserPlus,
  LogIn,
  LogOut,
  User,
  Lock,
  List
} from 'lucide-react';
import { AppMode, UserProfile, HelpMessage, AdminProfile, StudyLink, Notice } from './types';
import { 
  getStudyExplanation, 
  solveMath, 
  getTranslationAndGuide, 
  chatWithAiFriend, 
  getQA,
  checkDailyGoal,
  getSpeech,
  getSpellingCorrection
} from './geminiService';

// Audio Utils
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const DEFAULT_ADMIN: AdminProfile = {
  name: 'Rimon Mahmud Roman',
  email: 'romantechgp@gmail.com',
  photoUrl: ''
};

const BANNER_SIZES = [
  "728 x 90 px",
  "300 x 250 px",
  "336 x 280 px",
  "160 x 600 px",
  "300 x 600 px",
  "320 x 50 px",
  "320 x 100 px"
];

const AVATARS = ['🎓', '🚀', '💡', '🎨', '🧠', '🌟', '🤖', '📚'];

const STTButton: React.FC<{
  onResult: (text: string) => void;
  lang?: 'bn-BD' | 'en-US';
}> = ({ onResult, lang = 'bn-BD' }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : (window as any).webkitSpeechRecognition ? new (window as any).webkitSpeechRecognition() : null;
    
    if (!recognition) {
      alert("দুঃখিত, আপনার ব্রাউজার স্পিচ-টু-টেক্সট সমর্থন করে না।");
      return;
    }
    
    recognition.lang = lang;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.start();
  };

  return (
    <button 
      onClick={startListening}
      className={`p-3 rounded-2xl border transition-all shadow-sm ${isListening ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-indigo-600'}`}
      title="কথা বলুন"
    >
      <Mic size={20} />
    </button>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  );
};

const MenuButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'cyan' | 'rose';
  onClick: () => void;
}> = ({ icon, title, desc, color, onClick }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100 border-green-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100",
    pink: "bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-100",
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100",
    cyan: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-100",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100",
  }[color];

  return (
    <button 
      onClick={onClick}
      className={`${colorClasses} p-6 rounded-[32px] text-left transition-all hover:scale-[1.02] active:scale-[0.98] border shadow-sm flex flex-col gap-4 group`}
    >
      <div className="p-3 rounded-2xl bg-white shadow-sm w-fit group-hover:rotate-6 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
        <p className="text-sm font-medium opacity-80 mt-1">{desc}</p>
      </div>
    </button>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  
  // Database Simulation
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('studybuddy_users_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const loggedInId = localStorage.getItem('studybuddy_active_user_id');
    if (loggedInId) {
      const savedUsers = JSON.parse(localStorage.getItem('studybuddy_users_db') || '[]');
      const user = savedUsers.find((u: UserProfile) => u.id === loggedInId);
      if (user) {
        // Reset daily challenge if it's a new day
        if (user.lastChallengeDate !== new Date().toDateString()) {
          user.dailyChallengeCount = 0;
          user.lastChallengeDate = new Date().toDateString();
        }
        return user;
      }
    }
    return null;
  });

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem('studybuddy_admin_profile');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
  });
  
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>(() => {
    const saved = localStorage.getItem('studybuddy_help');
    return saved ? JSON.parse(saved) : [];
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('studybuddy_global_notices_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [homeBanner, setHomeBanner] = useState<string | null>(() => {
    return localStorage.getItem('studybuddy_home_banner_data');
  });

  const [homeBannerSize, setHomeBannerSize] = useState<string>(() => {
    return localStorage.getItem('studybuddy_home_banner_size') || "728 x 90 px";
  });

  const [studyLinks, setStudyLinks] = useState<StudyLink[]>(() => {
    const saved = localStorage.getItem('studybuddy_links');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('studybuddy_is_admin') === 'true';
  });
  const [loading, setLoading] = useState(false);

  // Persistence logic
  useEffect(() => {
    if (currentUser) {
      const updatedUsers = allUsers.map(u => u.id === currentUser.id ? currentUser : u);
      setAllUsers(updatedUsers);
      localStorage.setItem('studybuddy_users_db', JSON.stringify(updatedUsers));
      localStorage.setItem('studybuddy_active_user_id', currentUser.id);
    } else {
      localStorage.removeItem('studybuddy_active_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('studybuddy_admin_profile', JSON.stringify(adminProfile));
  }, [adminProfile]);

  useEffect(() => {
    localStorage.setItem('studybuddy_help', JSON.stringify(helpMessages));
  }, [helpMessages]);

  useEffect(() => {
    localStorage.setItem('studybuddy_is_admin', isAdmin.toString());
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('studybuddy_global_notices_list', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('studybuddy_links', JSON.stringify(studyLinks));
  }, [studyLinks]);

  useEffect(() => {
    if (homeBanner) {
      localStorage.setItem('studybuddy_home_banner_data', homeBanner);
    } else {
      localStorage.removeItem('studybuddy_home_banner_data');
    }
  }, [homeBanner]);

  useEffect(() => {
    localStorage.setItem('studybuddy_home_banner_size', homeBannerSize);
  }, [homeBannerSize]);

  const addPoints = (pts: number) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, points: prev.points + pts }) : null);
    }
  };

  const updateChallengeCount = () => {
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, dailyChallengeCount: Math.min(prev.dailyChallengeCount + 1, 3) }) : null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMode(AppMode.HOME);
  };

  const userStats = useMemo(() => {
    if (!currentUser) return { level: "Beginner", nextThreshold: 100, progress: 0 };
    const points = currentUser.points;
    let level = "শিক্ষানবিশ (Beginner)";
    let nextThreshold = 100;
    
    if (points >= 1000) {
      level = "লেজেন্ডারি ছাত্র (Legendary)";
      nextThreshold = 5000;
    } else if (points >= 500) {
      level = "মাস্টারমাইন্ড (Mastermind)";
      nextThreshold = 1000;
    } else if (points >= 200) {
      level = "অভিযাত্রী (Explorer)";
      nextThreshold = 500;
    } else if (points >= 100) {
      level = "উদ্যমী (Active)";
      nextThreshold = 200;
    }

    const progress = Math.min((points / nextThreshold) * 100, 100);
    return { level, nextThreshold, progress };
  }, [currentUser?.points]);

  const renderHome = () => {
    const match = homeBannerSize.match(/(\d+)\s*x\s*(\d+)/);
    const width = match ? parseInt(match[1]) : 728;
    const height = match ? parseInt(match[2]) : 90;
    const aspectRatio = `${width} / ${height}`;

    const containerStyle: React.CSSProperties = {
      aspectRatio,
      width: '100%',
      maxWidth: height > width ? `${width}px` : '100%',
      margin: '0 auto',
      maxHeight: height > width ? '400px' : 'auto'
    };

    if (!currentUser) return <AuthView onLogin={setCurrentUser} users={allUsers} setAllUsers={setAllUsers} />;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {homeBanner ? (
          <div className="w-full flex justify-center">
            <div 
              className="bg-white rounded-3xl overflow-hidden shadow-xl animate-in zoom-in border-4 border-white ring-1 ring-slate-100 flex items-center justify-center bg-slate-50" 
              style={containerStyle}
            >
              <img 
                src={homeBanner} 
                className="w-full h-full object-contain" 
                alt="Home Banner" 
              />
            </div>
          </div>
        ) : (
          <div className="bg-indigo-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-indigo-900">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Heart className="text-rose-400" fill="currentColor" /></div>
              <div>
                <p className="text-[10px] uppercase font-black opacity-60">প্রকল্প নির্মাতা</p>
                <h4 className="text-lg font-black tracking-tight">রিমন মাহমুদ রোমান</h4>
              </div>
            </div>
            <div className="bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3">
              <Mail size={16} />
              <span className="text-sm font-black lowercase text-indigo-50">romantechgp@gmail.com</span>
            </div>
          </div>
        )}

        {notices.length > 0 && (
          <div className="space-y-3 animate-in slide-up">
            {notices.map((n, idx) => (
              <div key={n.id} className={`bg-white border-2 border-slate-100 p-5 rounded-[28px] relative overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'}`}>
                    <Megaphone size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>
                        নোটিশ #{idx + 1}
                      </span>
                    </div>
                    <p className="text-slate-800 font-bold text-sm leading-relaxed">{n.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div 
          onClick={() => setMode(AppMode.PROFILE)}
          className="bg-white p-6 sm:p-8 rounded-[40px] shadow-xl shadow-indigo-100/50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all group"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[36px] overflow-hidden border-4 border-white shadow-xl ring-2 ring-indigo-50 group-hover:scale-105 transition-transform">
                {currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-5xl">{AVATARS[currentUser.points % AVATARS.length]}</div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-2xl border-2 border-white shadow-lg"><Zap size={18} fill="currentColor" /></div>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser.name}</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-600 text-white shadow-lg">LVL {Math.floor(currentUser.points / 50) + 1}</span>
              </div>
              <p className="text-sm font-bold text-slate-400 italic mt-1">{userStats.level}</p>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 flex flex-col items-center sm:items-end w-full sm:w-auto">
            <div className="flex items-center gap-2 text-yellow-500 font-black text-3xl"><Trophy size={28} /><span>{currentUser.points}</span></div>
            <div className="mt-2 w-full sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
              <div className="h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" style={{ width: `${userStats.progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MenuButton icon={<BookOpen size={28} />} title="সহজ পড়া মোড" color="blue" desc="টপিক গল্পের মতো বুঝে নাও" onClick={() => setMode(AppMode.STUDY)} />
          <MenuButton icon={<Calculator size={28} />} title="অংক সমাধানকারী" color="purple" desc="অংকের উত্তর ও ব্যাখ্যা" onClick={() => setMode(AppMode.MATH)} />
          <MenuButton icon={<Languages size={28} />} title="অনুবাদ ও উচ্চারণ" color="green" desc="ভাষা পরিবর্তন করে শেখা" onClick={() => setMode(AppMode.SPEAKING)} />
          <MenuButton icon={<HelpCircle size={28} />} title="প্রশ্ন ও উত্তর" color="orange" desc="যেকোনো শিক্ষামূলক প্রশ্ন" onClick={() => setMode(AppMode.QA)} />
          <MenuButton icon={<MessageCircle size={28} />} title="এআই বন্ধু চ্যাট" color="pink" desc="ইংরেজি প্র্যাকটিস করো" onClick={() => setMode(AppMode.FRIEND_CHAT)} />
          <MenuButton icon={<MessageSquare size={28} />} title="হেল্প লাইন চ্যাট" color="indigo" desc="সরাসরি সাপোর্ট নাও" onClick={() => setMode(AppMode.HELP_LINE)} />
          <MenuButton icon={<Type size={28} />} title="সঠিক বানান শিখুন" color="cyan" desc="ভুল বানান চেক করো" onClick={() => setMode(AppMode.SPELLING)} />
        </div>

        <button onClick={() => setMode(AppMode.GOAL)} className="w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 rounded-[40px] text-white shadow-2xl flex items-center justify-between group hover:scale-[1.01] transition-all border-b-8 border-indigo-900 active:border-b-0 active:translate-y-1">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20 group-hover:rotate-12 transition-transform"><Star size={40} className="text-yellow-400" fill="currentColor" /></div>
            <div className="text-left">
              <h3 className="text-2xl font-black tracking-tight">আজকের লক্ষ্য</h3>
              <p className="text-indigo-100 font-medium">১০ পয়েন্ট জিততে সঠিক বাক্য বলুন বা লিখুন</p>
            </div>
          </div>
          <div className="text-5xl font-black">{currentUser.dailyChallengeCount}<span className="text-indigo-300/50 text-2xl">/3</span></div>
        </button>

        {studyLinks.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-up">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><LinkIcon size={24} /></div>
                <h3 className="text-xl font-black text-slate-800">গুরুত্বপূর্ণ স্টাডি লিঙ্ক</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studyLinks.map(link => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 group-hover:text-indigo-400 shadow-sm shrink-0"><LinkIcon size={18} /></div>
                      <span className="font-black text-sm truncate">{link.title}</span>
                    </div>
                    <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/90 backdrop-blur-md shadow-md p-4 sticky top-0 z-50 border-b border-indigo-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div onClick={() => setMode(AppMode.HOME)} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform"><BookOpen fill="currentColor" size={24} /></div>
            <div><h1 className="text-2xl font-black text-slate-800 tracking-tight">স্টাডিবাডি</h1><p className="text-[11px] font-black text-slate-400">সহজ শিক্ষায় আপনার পাশে</p></div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setMode(AppMode.ADMIN)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><ShieldCheck size={22} /></button>
             {currentUser && (
               <button onClick={() => setMode(AppMode.PROFILE)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-100 bg-white group transition-transform hover:scale-105">
                  {currentUser.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl bg-indigo-50">🎓</div>}
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {mode !== AppMode.HOME && mode !== AppMode.ADMIN && (
          <button onClick={() => setMode(AppMode.HOME)} className="mb-6 flex items-center gap-2 text-slate-400 font-black hover:text-indigo-600 transition-colors group">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50"><ArrowLeft size={18} /></div>
            ফিরে যাও
          </button>
        )}

        {mode === AppMode.HOME && renderHome()}
        {mode === AppMode.STUDY && <StudyView setLoading={setLoading} />}
        {mode === AppMode.MATH && <MathView setLoading={setLoading} />}
        {mode === AppMode.SPELLING && <SpellingView setLoading={setLoading} />}
        {mode === AppMode.SPEAKING && <SpeakingView setLoading={setLoading} />}
        {mode === AppMode.QA && <QAView setLoading={setLoading} />}
        {mode === AppMode.FRIEND_CHAT && <FriendChatView setLoading={setLoading} />}
        {mode === AppMode.HELP_LINE && <HelpLineView helpMessages={helpMessages} setHelpMessages={setHelpMessages} userId={currentUser?.id || 'guest'} isAdmin={isAdmin} adminName={adminProfile.name} />}
        {mode === AppMode.ADMIN && <AdminPanel isAdmin={isAdmin} setIsAdmin={setIsAdmin} setMode={setMode} helpMessages={helpMessages} setHelpMessages={setHelpMessages} adminProfile={adminProfile} setAdminProfile={setAdminProfile} notices={notices} setNotices={setNotices} studyLinks={studyLinks} setStudyLinks={setStudyLinks} homeBanner={homeBanner} setHomeBanner={setHomeBanner} homeBannerSize={homeBannerSize} setHomeBannerSize={setHomeBannerSize} allUsers={allUsers} />}
        {mode === AppMode.GOAL && <GoalView addPoints={addPoints} updateCount={updateChallengeCount} currentCount={currentUser?.dailyChallengeCount || 0} setLoading={setLoading} />}
        {mode === AppMode.PROFILE && <ProfileView profile={currentUser} setProfile={setCurrentUser} stats={userStats} onLogout={handleLogout} />}
      </main>

      <footer className="bg-white border-t p-10 text-center mt-12">
        <p className="max-w-md mx-auto text-slate-400 font-bold italic text-sm">"প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।"</p>
      </footer>

      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in">
          <div className="bg-white p-12 rounded-[48px] shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-black text-2xl mt-8">এআই বন্ধু ভাবছে...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Auth Component ---

const AuthView: React.FC<{ 
  onLogin: (user: UserProfile) => void; 
  users: UserProfile[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}> = ({ onLogin, users, setAllUsers }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('ভুল ইমেইল বা পাসওয়ার্ড! আবার চেষ্টা করুন।');
      }
    } else {
      if (users.some(u => u.email === email)) {
        setError('এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট করা হয়েছে।');
        return;
      }
      if (!name || !email || !password) {
        setError('সবগুলো ঘর পূরণ করুন।');
        return;
      }
      
      const newUser: UserProfile = {
        id: Date.now().toString(),
        email,
        password,
        name,
        bio: 'আমি স্টাডিবাডির সাথে শিখছি!',
        points: 0,
        streak: 0,
        dailyChallengeCount: 0,
        lastChallengeDate: new Date().toDateString(),
        joinDate: new Date().toLocaleDateString('bn-BD')
      };
      
      setAllUsers(prev => [...prev, newUser]);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in zoom-in">
      <div className="bg-white w-full max-w-md p-10 rounded-[48px] shadow-2xl border border-slate-100 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
            {isLogin ? <LogIn size={40} /> : <UserPlus size={40} />}
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {isLogin ? 'স্টাডিবাডিতে লগইন করুন' : 'নতুন অ্যাকাউন্ট খুলুন'}
          </h2>
          <p className="text-slate-400 font-bold text-sm">
            {isLogin ? 'আপনার পড়াশোনার যাত্রা চালিয়ে যান' : 'সহজ উপায়ে শেখা শুরু করার প্রথম ধাপ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-4">আপনার নাম</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 transition-all shadow-inner" 
                  placeholder="আপনার নাম লিখুন" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase ml-4">Gmail / Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 transition-all shadow-inner" 
                placeholder="example@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase ml-4">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 transition-all shadow-inner" 
                placeholder="পাসওয়ার্ড দিন" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs font-bold text-red-500 text-center animate-shake">{error}</p>}

          <button className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-xl transition-all border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1">
            {isLogin ? 'লগইন করুন' : 'সাইন-আপ করুন'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-50">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-black text-sm hover:underline"
          >
            {isLogin ? 'অ্যাকাউন্ট নেই? সাইন-আপ করুন' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- View Components ---

const ImagePreview = ({ image, onClear }: { image: string, onClear: () => void }) => (
  <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-slate-50 bg-slate-50 group mb-4"><img src={image} className="w-full h-full object-contain" alt="Uploaded Content" /><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4"><button onClick={onClear} className="p-4 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform" title="মুছে ফেলুন"><X size={24} /></button><div className="p-4 bg-white rounded-full text-indigo-600 shadow-xl hover:scale-110 transition-transform cursor-help" title="সঠিকভাবে ক্রপ করার জন্য মোবাইল ক্যামেরা ব্যবহার করুন"><Crop size={24} /></div></div></div>
);

const StudyView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const handleSubmit = async () => { if (!input.trim()) return; setLoading(true); try { const res = await getStudyExplanation(input); setResult(res || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।'); } catch (e) { setResult('একটি সমস্যা হয়েছে। আবার চেষ্টা করো।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-blue-50 rounded-3xl text-blue-600"><BookOpen size={32} /></div><h2 className="text-2xl font-black text-slate-800">সহজ পড়া মোড</h2></div><STTButton onResult={(text) => setInput(text)} /></div><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:ring-4 focus:ring-blue-100 outline-none min-h-[240px] font-bold text-slate-700 transition-all shadow-inner text-base" placeholder="টপিকের নাম লিখুন বা মাইক্রোফোন ব্যবহার করুন..." value={input} onChange={(e) => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all text-xl"><Send size={20} /> শুরু করো</button>{result && <div className="p-8 sm:p-10 bg-blue-50/50 rounded-[32px] border-2 border-blue-100 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up text-sm sm:text-base text-justify">{result}</div>}</div>
  );
};

const MathView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setImage(reader.result as string); reader.readAsDataURL(file); } };
  const handleSubmit = async () => { if (!input.trim() && !image) return; setLoading(true); try { const base64Data = image ? image.split(',')[1] : undefined; const res = await solveMath(input, base64Data); setResult(res || 'সমাধান করা সম্ভব হয়নি।'); } catch (e) { setResult('ভুল হয়েছে।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-purple-50 rounded-3xl text-purple-600"><Calculator size={32} /></div><h2 className="text-2xl font-black text-slate-800">অংক সমাধানকারী</h2></div><div className="flex gap-2"><STTButton onResult={(text) => setInput(text)} /><button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl hover:text-indigo-600 transition-all shadow-sm" title="ছবি তুলুন"><Camera size={20} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} /></div></div>{image && <ImagePreview image={image} onClear={() => setImage(null)} />}<textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:ring-4 focus:ring-purple-100 outline-none font-bold text-slate-700 transition-all shadow-inner text-base min-h-[160px]" placeholder="অংকটি লিখুন অথবা ক্যামেরা বাটন চেপে অংকের ছবি দিন..." value={input} onChange={(e) => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-3 text-xl"><Calculator size={20} /> সমাধান করো</button>{result && <div className="p-8 sm:p-10 bg-purple-50/50 rounded-[32px] border-2 border-purple-100 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up text-sm sm:text-base text-justify">{result}</div>}</div>
  );
};

const SpellingView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [result, setResult] = useState<string | null>(null);
  const handleSubmit = async () => { if (!input.trim()) return; setLoading(true); try { const res = await getSpellingCorrection(input, lang); setResult(res || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।'); } catch (e) { setResult('একটি সমস্যা হয়েছে। আবার চেষ্টা করো।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-cyan-50 rounded-3xl text-cyan-600"><Type size={32} /></div><div><h2 className="text-2xl font-black text-slate-800">সঠিক বানান শিখুন</h2><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ভুল সংশোধন ও নিয়ম জানুন</p></div></div><div className="flex gap-2"><button onClick={() => {setLang('bn'); setResult(null);}} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${lang === 'bn' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>বাংলা</button><button onClick={() => {setLang('en'); setResult(null);}} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>English</button></div></div><div className="relative"><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:ring-4 focus:ring-cyan-100 outline-none min-h-[180px] font-bold text-slate-700 transition-all shadow-inner text-base" placeholder={lang === 'bn' ? "এখানে বাংলা লেখাটি লিখুন..." : "Write your English text here..."} value={input} onChange={(e) => setInput(e.target.value)} /><div className="absolute bottom-4 right-4"><STTButton onResult={(text) => setInput(text)} lang={lang === 'bn' ? 'bn-BD' : 'en-US'} /></div></div><button onClick={handleSubmit} className="w-full bg-cyan-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-cyan-700 shadow-xl shadow-cyan-100 transition-all text-xl"><Check size={20} /> বানান চেক করো</button>{result && (<div className="p-8 sm:p-10 bg-cyan-50/50 rounded-[32px] border-2 border-cyan-100 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up text-sm sm:text-base relative text-justify"><div className="absolute top-4 right-4"><CopyButton text={result} /></div>{result}</div>)}</div>
  );
};

const SpeakingView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'bn-en' | 'en-bn'>('bn-en');
  const [result, setResult] = useState<{translation: string, pronunciation: string} | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const handleSubmit = async () => { if (!input.trim()) return; setLoading(true); try { const rawRes = await getTranslationAndGuide(input, direction); if (rawRes) { const transMatch = rawRes.match(/TRANSLATION:\s*(.*)/); const pronMatch = rawRes.match(/PRONUNCIATION:\s*(.*)/); if (transMatch) { setResult({ translation: transMatch[1].trim(), pronunciation: pronMatch ? pronMatch[1].trim() : '' }); } } } catch (e) { console.error(e); } finally { setLoading(false); } };
  const playTranslation = async () => { if (!result || isSpeaking) return; const textToSpeak = direction === 'bn-en' ? result.translation : input; setIsSpeaking(true); try { const base64Audio = await getSpeech(textToSpeak); if (base64Audio) { if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); } const ctx = audioContextRef.current; const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1); const source = ctx.createBufferSource(); source.buffer = audioBuffer; source.connect(ctx.destination); source.onended = () => setIsSpeaking(false); source.start(); } else { setIsSpeaking(false); } } catch (e) { console.error(e); setIsSpeaking(false); } };
  return (
    <div className="space-y-6 animate-in slide-up"><div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-green-50 rounded-3xl text-green-600 shadow-inner"><Languages size={32} /></div><div><h2 className="text-2xl font-black text-slate-800">অনুবাদ ও উচ্চারণ</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest">ভাষা পরিবর্তন করে শেখা</p></div></div><div className="flex gap-2"><STTButton onResult={(text) => setInput(text)} lang={direction === 'bn-en' ? 'bn-BD' : 'en-US'} /><button onClick={() => {setDirection(prev => prev === 'bn-en' ? 'en-bn' : 'bn-en'); setResult(null); setInput('');}} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm group active:scale-95"><span className="text-xs">{direction === 'bn-en' ? 'BN → EN' : 'EN → BN'}</span><ArrowRightLeft size={16} /></button></div></div><div className="relative"><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:ring-4 focus:ring-green-100 outline-none font-bold text-slate-700 transition-all shadow-inner text-base min-h-[180px]" placeholder={direction === 'bn-en' ? "বাংলায় লিখুন বা মাইক্রোফোন চাপুন..." : "Write in English or use mic..."} value={input} onChange={(e) => setInput(e.target.value)} /><button onClick={handleSubmit} disabled={!input.trim()} className="absolute bottom-4 right-4 bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-90 disabled:opacity-50"><Send size={20} /></button></div></div>{result && (<div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl border-4 border-green-50 space-y-8 animate-in zoom-in relative overflow-hidden text-center"><div className="space-y-4"><div className="flex items-center justify-center gap-2"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">সঠিক অনুবাদ</span><CopyButton text={result.translation} /></div><p className="text-[13px] sm:text-[15px] font-bold text-slate-700 leading-relaxed text-justify px-1 sm:px-4 break-words">{result.translation}</p></div><div className="p-4 sm:p-6 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 space-y-3"><div className="flex items-center justify-center gap-2"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">সঠিক উচ্চারণ</span><CopyButton text={result.pronunciation} /></div><p className="text-[13px] sm:text-[16px] font-black text-green-700 break-words">{result.pronunciation}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><button onClick={playTranslation} disabled={isSpeaking} className={`flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-base transition-all shadow-md ${isSpeaking ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}>{isSpeaking ? <RefreshCw size={20} className="animate-spin" /> : <Volume2 size={20} />}শুনুন (Listen)</button><button className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-green-600 text-green-600 rounded-2xl font-black text-base hover:bg-green-50 transition-all shadow-sm group"><Mic size={20} /> প্র্যাকটিস করো</button></div></div>)}</div>
  );
};

const QAView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setImage(reader.result as string); reader.readAsDataURL(file); } };
  const handleSubmit = async () => { if (!input.trim() && !image) return; setLoading(true); try { const base64Data = image ? image.split(',')[1] : undefined; const res = await getQA(input, base64Data); setResult(res || 'উত্তর পাওয়া যায়নি।'); } catch (e) { setResult('একটি সমস্যা হয়েছে। আবার চেষ্টা করো।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-orange-50 rounded-3xl text-orange-600"><HelpCircle size={32} /></div><h2 className="text-2xl font-black text-slate-800">প্রশ্ন ও উত্তর</h2></div><div className="flex gap-2"><STTButton onResult={(text) => setInput(text)} /><button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl hover:text-indigo-600 transition-all shadow-sm"><Camera size={20} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} /></div></div>{image && <ImagePreview image={image} onClear={() => setImage(null)} />}<textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-700 shadow-inner min-h-[180px] text-base" placeholder="প্রশ্ন লিখুন অথবা ক্যামেরা চেপে প্রশ্নের ছবি দিন..." value={input} onChange={(e) => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all text-xl flex items-center justify-center gap-3"><Send size={24} /> উত্তর খোঁজো</button>{result && <div className="p-8 sm:p-10 bg-orange-50/50 rounded-[32px] border-2 border-orange-100 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up text-sm sm:text-base text-justify">{result}</div>}</div>
  );
};

const FriendChatView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{sender: 'user' | 'ai', text: string}[]>([
    { sender: 'ai', text: 'আসসালামু আলাইকুম! Hello! I am your AI Study Friend. Let\'s practice English together! (চলো একসাথে ইংরেজি প্র্যাকটিস করি!)' }
  ]);
  const handleSubmit = async () => { if (!input.trim()) return; const userMsg = input; setInput(''); const newChatLog: any[] = [...chatLog, { sender: 'user', text: userMsg }]; setChatLog(newChatLog); setLoading(true); try { const history = chatLog.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] })); const res = await chatWithAiFriend(history, userMsg); setChatLog(prev => [...prev, { sender: 'ai', text: res || 'I see! Tell me more.' }]); } catch (e) { setChatLog(prev => [...prev, { sender: 'ai', text: 'I am a bit confused. Can you say that again?' }]); } finally { setLoading(false); } };
  return (
    <div className="bg-white rounded-[48px] shadow-xl flex flex-col h-[600px] overflow-hidden border border-slate-100 animate-in slide-up"><div className="p-6 border-b bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black">AI</div><div><h3 className="font-black">এআই বন্ধু</h3><p className="text-xs opacity-80">ইংরেজি শিখুন আড্ডায়</p></div></div><STTButton onResult={(text) => setInput(text)} lang="en-US" /></div><div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">{chatLog.map((msg, i) => (<div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] p-4 rounded-[28px] font-bold text-[13px] sm:text-[14px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}><p className="text-justify">{msg.text}</p></div></div>))}</div><div className="p-6 bg-white border-t flex flex-col gap-3"><div className="flex gap-3"><input className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-slate-700 text-base" placeholder="ইংরেজিতে কিছু লিখুন..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} /><button onClick={handleSubmit} className="bg-pink-500 text-white p-4 rounded-2xl hover:bg-pink-600 shadow-lg shadow-pink-100 transition-all active:scale-90"><Send size={24} /></button></div><p className="text-[10px] text-slate-400 text-center font-bold italic">ভুল করলে আমি বাংলায় বুঝিয়ে দেবো! 😊</p></div></div>
  );
};

const HelpLineView = ({ helpMessages, setHelpMessages, userId, isAdmin, adminName }: any) => {
  const [input, setInput] = useState('');
  const handleSendMessage = () => { if (!input.trim()) return; const newMessage: HelpMessage = { id: Date.now().toString(), userId, userName: isAdmin ? (adminName || 'Admin') : 'User', text: input, timestamp: Date.now(), isAdmin }; setHelpMessages((prev: HelpMessage[]) => [...prev, newMessage]); setInput(''); };
  const filteredMessages = helpMessages.filter((m: HelpMessage) => isAdmin || m.userId === userId);
  return (
    <div className="bg-white rounded-[48px] shadow-xl flex flex-col h-[600px] overflow-hidden animate-in slide-up border border-slate-100"><div className="p-6 border-b bg-indigo-600 text-white flex items-center justify-between"><div className="flex items-center gap-3"><MessageCircle size={24} /><h3 className="font-black">হেল্প লাইন চ্যাট</h3></div><STTButton onResult={(text) => setInput(text)} /></div><div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">{filteredMessages.map((msg: HelpMessage) => (<div key={msg.id} className={`flex ${msg.isAdmin === isAdmin ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 rounded-3xl font-bold text-[13px] sm:text-[14px] shadow-md ${msg.isAdmin === isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}><div className="text-[10px] uppercase opacity-60 mb-1">{msg.userName}</div>{msg.text}<div className="text-[8px] mt-2 opacity-50 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div></div></div>))}</div><div className="p-6 bg-white border-t flex gap-3"><input className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700" placeholder="আপনার মেসেজ..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} /><button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 shadow-xl transition-all active:scale-90"><Send size={24} /></button></div></div>
  );
};

const AdminPanel = ({ isAdmin, setIsAdmin, setMode, helpMessages, setHelpMessages, adminProfile, setAdminProfile, notices, setNotices, studyLinks, setStudyLinks, homeBanner, setHomeBanner, homeBannerSize, setHomeBannerSize, allUsers }: any) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'messages' | 'notice' | 'links' | 'banner'>('dashboard');
  const [noticeInput, setNoticeInput] = useState('');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleLogin = () => {
    const adminEmail = 'romantechgp@gmail.com';
    const adminPhone = '01617365471';
    const adminPass = '13457@Hunter'; 
    
    if ((id === adminEmail || id === adminPhone) && pass === adminPass) { 
      setIsAdmin(true); 
      setError(''); 
    } else { 
      setError('ভুল আইডি বা পাসওয়ার্ড! শুধুমাত্র রিমন মাহমুদ প্রবেশ করতে পারবেন।'); 
    }
  };

  const handleAddNotice = () => {
    if (!noticeInput.trim()) return;
    if (notices.length >= 3) {
      alert('সর্বোচ্চ ৩টি নোটিশ একসাথে রাখা সম্ভব। অনুগ্রহ করে একটি মুছে নতুনটি যোগ করুন।');
      return;
    }
    const newNotice: Notice = {
      id: Date.now().toString(),
      text: noticeInput,
      timestamp: Date.now()
    };
    setNotices([newNotice, ...notices]);
    setNoticeInput('');
    setPublishMessage('নোটিশটি সফলভাবে যোগ করা হয়েছে!');
    setTimeout(() => setPublishMessage(null), 5000);
  };

  const deleteNotice = (nid: string) => {
    setNotices(notices.filter((n: Notice) => n.id !== nid));
    setPublishMessage('নোটিশটি মুছে ফেলা হয়েছে।');
    setTimeout(() => setPublishMessage(null), 5000);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHomeBanner(reader.result as string);
        setPublishMessage('ব্যানারটি সফলভাবে আপডেট করা হয়েছে!');
        setTimeout(() => setPublishMessage(null), 5000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      alert('দয়া করে শিরোনাম এবং লিঙ্ক দুটোই দিন।');
      return;
    }
    const newLink: StudyLink = {
      id: Date.now().toString(),
      title: linkTitle,
      url: linkUrl,
      date: new Date().toLocaleDateString('bn-BD')
    };
    setStudyLinks([...studyLinks, newLink]);
    setLinkTitle('');
    setLinkUrl('');
    setPublishMessage('লিঙ্কটি সফলভাবে পোস্ট করা হয়েছে!');
    setTimeout(() => setPublishMessage(null), 5000);
  };

  const deleteLink = (lid: string) => {
    setStudyLinks(studyLinks.filter((l: StudyLink) => l.id !== lid));
    setPublishMessage('লিঙ্কটি মুছে ফেলা হয়েছে।');
    setTimeout(() => setPublishMessage(null), 5000);
  };

  if (isAdmin) {
    const bannerMatch = homeBannerSize.match(/(\d+)\s*x\s*(\d+)/);
    const bW = bannerMatch ? parseInt(bannerMatch[1]) : 728;
    const bH = bannerMatch ? parseInt(bannerMatch[2]) : 90;

    // Aggregate real data for the dashboard
    const totalPoints = allUsers.reduce((acc: number, u: UserProfile) => acc + (u.points || 0), 0);
    const totalChallengesToday = allUsers.reduce((acc: number, u: UserProfile) => acc + (u.dailyChallengeCount || 0), 0);
    const activeUsersCount = allUsers.filter((u: UserProfile) => u.points > 0).length;

    return (
      <div className="space-y-8 animate-in zoom-in">
        <div className="bg-red-50 border-l-8 border-red-500 p-6 rounded-2xl shadow-sm">
           <h4 className="text-red-700 font-black text-lg">সতর্কবার্তা: শুধু মাত্র এডমিন রিমন মাহমুদ রোমান লগইন করতে পারবে</h4>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center justify-between sticky top-[80px] z-40 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard size={18} /> ড্যাশবোর্ড</button>
            <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><Database size={18} /> ইউজার</button>
            <button onClick={() => setActiveTab('messages')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><MessageCircle size={18} /> মেসেজ</button>
            <button onClick={() => setActiveTab('notice')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === 'notice' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><Megaphone size={18} /> নোটিশ</button>
            <button onClick={() => setActiveTab('links')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === 'links' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><PlusCircle size={18} /> লিঙ্ক</button>
            <button onClick={() => setActiveTab('banner')} className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === 'banner' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><ImageIcon size={18} /> ব্যানার</button>
          </div>
          <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-600 px-6 py-2 rounded-2xl font-black text-sm hover:bg-red-100 shrink-0">লগআউট</button>
        </div>

        {publishMessage && (
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in text-green-700 font-bold">
            <CircleCheck size={20} /> {publishMessage}
          </div>
        )}

        {activeTab === 'banner' && (
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-up">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-50 rounded-3xl text-purple-600 border border-purple-100"><ImageIcon size={32} /></div>
              <div><h3 className="text-2xl font-black text-slate-800">ব্যানার ম্যানেজমেন্ট</h3><p className="text-sm font-bold text-slate-400">সাইজ নির্বাচন করে ইমেজ আপলোড করুন</p></div>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-4">ব্যানার সাইজ নির্বাচন করুন (Banner Size Select)</label>
                <div className="relative">
                  <select 
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 shadow-sm appearance-none"
                    value={homeBannerSize}
                    onChange={(e) => setHomeBannerSize(e.target.value)}
                  >
                    {BANNER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Maximize size={18} />
                  </div>
                </div>
              </div>

              <div className="p-10 border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-6 bg-white hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl shadow-lg flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform group-hover:text-indigo-600">
                  <Camera size={40} />
                </div>
                <div className="text-center">
                  <p className="text-slate-700 font-black text-lg">ব্যানার ইমেজ আপলোড করুন</p>
                  <p className="text-slate-400 text-sm font-bold">নির্বাচিত সাইজ: {homeBannerSize}</p>
                </div>
              </div>
            </div>

            {homeBanner && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest">বর্তমান ব্যানার প্রিভিউ ({homeBannerSize}):</h4>
                  <button onClick={() => setHomeBanner(null)} className="text-red-500 font-black text-xs hover:underline flex items-center gap-1"><Trash2 size={14} /> ব্যানার মুছে ফেলুন</button>
                </div>
                <div className="flex justify-center p-6 bg-slate-100 rounded-[32px] border-2 border-slate-200 overflow-hidden">
                   <div 
                    className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden flex items-center justify-center" 
                    style={{ 
                      aspectRatio: `${bW} / ${bH}`, 
                      width: '100%', 
                      maxWidth: bH > bW ? `${bW}px` : '100%',
                      maxHeight: bH > 500 ? '500px' : 'auto' 
                    }}
                   >
                     <img src={homeBanner} className="w-full h-full object-contain" alt="Banner Preview" />
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notice' && (
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-up">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-50 rounded-3xl text-yellow-600 border border-yellow-100"><Megaphone size={32} /></div>
                <div><h3 className="text-2xl font-black text-slate-800">নোটিশ বোর্ড লিস্ট</h3><p className="text-sm font-bold text-slate-400">একসাথে সর্বোচ্চ ৩টি নোটিশ পাবলিশ করতে পারবেন</p></div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-dashed border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-4">নতুন নোটিশ লিখুন ({notices.length}/3)</label>
                  <textarea 
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 focus:ring-4 focus:ring-yellow-100 outline-none min-h-[120px] font-bold text-slate-700 shadow-sm" 
                    placeholder="নোটিশের লেখাটি লিখুন..." 
                    value={noticeInput} 
                    onChange={(e) => setNoticeInput(e.target.value)} 
                    disabled={notices.length >= 3}
                  />
                </div>
                <button 
                  onClick={handleAddNotice} 
                  disabled={!noticeInput.trim() || notices.length >= 3}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                >
                  <PlusCircle size={20} /> নোটিশ যোগ করো
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest ml-2">বর্তমান নোটিশসমূহ</h4>
              {notices.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100 text-slate-300 italic font-bold">কোনো নোটিশ পাবলিশ করা হয়নি</div>
              ) : (
                notices.map((n, idx) => (
                  <div key={n.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-yellow-100 transition-all">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-50 shrink-0 font-black">
                        {idx + 1}
                      </div>
                      <p className="font-bold text-slate-700 text-sm leading-relaxed">{n.text}</p>
                    </div>
                    <button onClick={() => deleteNotice(n.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shrink-0 ml-4"><Trash2 size={20} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-up">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 border border-indigo-100"><PlusCircle size={32} /></div>
                <div><h3 className="text-2xl font-black text-slate-800">যেকোনো লিঙ্ক পোস্ট করুন</h3><p className="text-sm font-bold text-slate-400">গুগল ড্রাইভ, ইউটিউব বা যেকোনো শিক্ষামূলক লিঙ্ক শেয়ার করুন</p></div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-dashed border-slate-200 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-4">লিঙ্ক শিরোনাম</label>
                    <input 
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 shadow-sm"
                      placeholder="যেমন: ইংরেজি ক্লাসের ড্রাইভ লিঙ্ক"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-4">ইউআরএল (URL)</label>
                    <input 
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 shadow-sm"
                      placeholder="https://example.com/..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  onClick={handlePostLink}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Send size={20} /> লিঙ্ক পোস্ট করো
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest ml-2">বর্তমান লিঙ্কসমূহ ({studyLinks.length})</h4>
              {studyLinks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100 text-slate-300 italic font-bold">কোনো লিঙ্ক পোস্ট করা হয়নি</div>
              ) : (
                studyLinks.map((link: StudyLink) => (
                  <div key={link.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 shrink-0"><PlusCircle size={20} /></div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-700 truncate">{link.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{link.url}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteLink(link.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shrink-0"><Trash2 size={20} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-up">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100"><Users size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">মোট ইউজার</p>
                <p className="text-4xl font-black text-slate-800">{allUsers.length}</p>
              </div>
              <div className="flex items-center gap-2 text-green-500 font-bold text-xs"><TrendingUp size={14} /> {activeUsersCount} অ্যাক্টিভ ইউজার</div>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100"><Zap size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">আজকের অ্যাক্টিভিটি</p>
                <p className="text-4xl font-black text-slate-800">{totalChallengesToday}</p>
              </div>
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs"><Clock size={14} /> মোট চ্যালেঞ্জ সম্পন্ন</div>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center border border-yellow-100"><Star size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">পয়েন্ট ডিস্ট্রিবিউশন</p>
                <p className="text-4xl font-black text-slate-800">{totalPoints}</p>
              </div>
              <div className="flex items-center gap-2 text-yellow-600 font-bold text-xs"><Trophy size={14} /> সর্বমোট অর্জিত পয়েন্ট</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-up"><div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-black text-slate-800">সকল ইউজার ডাটাবেস</h3><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm" placeholder="ইউজার খুঁজুন..." /></div></div><div className="overflow-x-auto rounded-3xl border border-slate-50"><table className="w-full text-left"><thead className="bg-slate-50"><tr className="text-[10px] font-black uppercase tracking-widest text-slate-400"><th className="p-6">ইউজার</th><th className="p-6">ইমেইল</th><th className="p-6">পয়েন্ট</th><th className="p-6">যোগদান</th></tr></thead><tbody className="divide-y divide-slate-50">{allUsers.map(user => (<tr key={user.id} className="hover:bg-slate-50/50 transition-colors"><td className="p-6"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">{user.name.charAt(0)}</div><span className="font-bold text-slate-700">{user.name}</span></div></td><td className="p-6 text-sm text-slate-400 font-medium">{user.email}</td><td className="p-6 text-indigo-600 font-black">{user.points}</td><td className="p-6 text-xs text-slate-300 font-bold">{user.joinDate}</td></tr>))}</tbody></table></div></div>
        )}
        
        {activeTab === 'messages' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-up"><h3 className="text-xl font-black mb-6">সকল মেসেজ ইনবক্স</h3><div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">{helpMessages.length === 0 ? (<div className="text-center py-20 text-slate-300 italic font-bold">কোনো মেসেজ নেই</div>) : (helpMessages.map((m: any) => (<div key={m.id} className={`p-6 rounded-3xl border-2 ${m.isAdmin ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-indigo-100 shadow-sm'}`}><div className="flex justify-between items-center mb-2"><p className="text-xs font-black uppercase text-indigo-600">{m.userName}</p><p className="text-[10px] text-slate-400">{new Date(m.timestamp).toLocaleString()}</p></div><p className="text-slate-700 font-bold">{m.text}</p>{!m.isAdmin && (<button onClick={() => { const reply = prompt(`${m.userName}-কে রিপ্লাই দিন:`); if (reply) { setHelpMessages([...helpMessages, { id: Date.now().toString(), userId: m.userId, userName: adminProfile.name, text: reply, timestamp: Date.now(), isAdmin: true }]); } }} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100">রিপ্লাই পাঠান</button>)}</div>)))}</div></div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[48px] shadow-2xl max-w-md mx-auto space-y-8 animate-in slide-up border border-slate-100">
      <div className="text-center space-y-4"><div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><ShieldCheck size={40} className="text-indigo-600" /></div><h2 className="text-3xl font-black text-slate-800 tracking-tight">অ্যাডমিন প্রবেশ</h2><div className="p-4 bg-red-50 rounded-2xl border-2 border-red-100 animate-pulse"><p className="text-red-600 font-black text-xs uppercase tracking-tight">সতর্কবার্তা: শুধু মাত্র এডমিন রিমন মাহমুদ রোমান লগইন করতে পারবে</p></div></div>
      <div className="space-y-6">
        <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">আপনার অ্যাডমিন আইডি</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 transition-all shadow-inner" placeholder="ইমেইল বা ফোন নম্বর" value={id} onChange={(e) => setId(e.target.value)} /></div>
        <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">পাসওয়ার্ড</label><input type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-700 transition-all shadow-inner" placeholder="গোপন পাসওয়ার্ড দিন" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
        {error && <p className="text-xs font-bold text-red-500 text-center animate-shake">{error}</p>}<button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-xl transition-all border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1">অ্যাডমিন প্যানেলে প্রবেশ</button>
      </div>
    </div>
  );
};

const ProfileView = ({ profile, setProfile, stats, onLogout }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setProfile((prev: any) => prev ? ({ ...prev, photoUrl: reader.result as string }) : null); reader.readAsDataURL(file); } };
  if (!profile) return null;
  return (
    <div className="space-y-8 animate-in slide-up"><div className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6"><div className="relative group"><div className="w-32 h-32 bg-indigo-50 rounded-[40px] overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">{profile.photoUrl ? (<img src={profile.photoUrl} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>)}</div><button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all border-2 border-white"><Camera size={20} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} /></div><div className="space-y-2"><h2 className="text-4xl font-black text-slate-800 tracking-tight">{profile.name}</h2><div className="flex items-center justify-center gap-2"><span className="bg-indigo-600 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{stats.level}</span><span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-yellow-200">{profile.points} POINTS</span></div></div></div><div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6"><h3 className="text-xl font-black flex items-center gap-2"><Settings size={22} className="text-indigo-600" /> প্রোফাইল তথ্য</h3><div className="space-y-4"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">আপনার নাম</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 shadow-inner" value={profile.name} onChange={(e) => setProfile((prev: any) => prev ? ({ ...prev, name: e.target.value }) : null)} /></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">আপনার লক্ষ্য (Bio)</label><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 min-h-[100px] shadow-inner" value={profile.bio} onChange={(e) => setProfile((prev: any) => prev ? ({ ...prev, bio: e.target.value }) : null)} /></div><button onClick={onLogout} className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-colors border border-red-100"><LogOut size={18} /> লগআউট করুন</button></div></div></div>
  );
};

const GoalView = ({ addPoints, updateCount, currentCount, setLoading }: any) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rewardClaimable, setRewardClaimable] = useState(false);
  
  const handleCheck = async () => { 
    if (!input.trim()) return; 
    setLoading(true); 
    setFeedback(null); 
    setIsSuccess(false); 
    setRewardClaimable(false); 
    try { 
      const res = await checkDailyGoal(input); 
      if (res?.toUpperCase().includes('SUCCESS')) { 
        setIsSuccess(true); 
        setRewardClaimable(true); 
        setFeedback('চমৎকার! আপনার বাক্যটি সঠিক হয়েছে। এখন নিচ থেকে পুরস্কার গ্রহণ করুন!'); 
      } else { 
        setFeedback(res || 'দুঃখিত, কোনো ভুল আছে। আবার চেষ্টা করুন।'); 
      } 
    } catch (e) { 
      setFeedback('একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।'); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  const handleClaimReward = () => { 
    addPoints(10); 
    updateCount(); 
    setRewardClaimable(false); 
    setIsSuccess(false); 
    setFeedback('অভিনন্দন! ১০ পয়েন্ট আপনার ড্যাশবোর্ডে যোগ করা হয়েছে।'); 
    setInput(''); 
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-50 rounded-3xl text-yellow-600 shadow-sm border border-yellow-100"><Star size={32} fill="currentColor" /></div>
          <div><h2 className="text-2xl font-black text-slate-800 tracking-tight">আজকের লক্ষ্য</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">সঠিক ইংরেজি বাক্য গঠন করুন</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
            <span className="text-3xl font-black text-indigo-600">{currentCount}</span>
            <span className="text-indigo-300 font-bold ml-1">/ 3</span>
          </div>
        </div>
      </div>
      
      {currentCount >= 3 ? (
        <div className="p-12 bg-green-50 rounded-[40px] border-4 border-dashed border-green-200 text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-2xl font-black text-green-800">আজকের সব লক্ষ্য পূরণ হয়েছে!</h3>
          <p className="text-green-600 font-bold">আপনি সব পয়েন্ট জিতে নিয়েছেন। আগামীকাল আবার ফিরে আসুন।</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4">
              <label className="text-sm font-black text-slate-500 uppercase tracking-tighter">বাক্য লিখুন বা মাইক ব্যবহার করুন</label>
              <STTButton onResult={(text) => setInput(text)} lang="en-US" />
            </div>
            <textarea 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] p-8 focus:ring-4 focus:ring-yellow-100 outline-none min-h-[150px] font-bold text-slate-700 transition-all shadow-inner text-lg sm:text-xl" 
              placeholder="যেমন: I love studying with StudyBuddy." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
          </div>
          <button 
            onClick={handleCheck} 
            disabled={!input.trim() || rewardClaimable} 
            className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black hover:bg-indigo-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 text-xl"
          >
            চেক করুন
          </button>
          
          {feedback && (
            <div className={`p-8 rounded-[32px] border-2 animate-in zoom-in ${isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-start gap-4">
                {isSuccess ? <Award className="text-green-600 shrink-0" size={32} /> : <Zap className="text-red-500 shrink-0" size={32} />}
                <p className="font-bold text-xs sm:text-sm leading-relaxed">{feedback}</p>
              </div>
            </div>
          )}
          
          {rewardClaimable && (
            <button 
              onClick={handleClaimReward} 
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-6 rounded-3xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-yellow-100 border-b-8 border-orange-700 animate-bounce-short"
            >
              পুরস্কার গ্রহণ করো (+১০ পয়েন্ট)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
