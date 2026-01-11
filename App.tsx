
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
  Copy,
  Check,
  LayoutDashboard,
  Users,
  X,
  Megaphone,
  Bell,
  Trash2,
  ExternalLink,
  PlusCircle,
  Link as LinkIcon,
  LogIn,
  LogOut,
  User,
  UserPlus,
  UserX,
  ShieldAlert,
  ShieldOff,
  Key,
  Info,
  Type,
  // Added Eye and EyeOff to fix errors on line 809
  Eye,
  EyeOff
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
  const isInternalChange = useRef(false);

  // Data State
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

  // Navigation History Management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isInternalChange.current = true;
      if (event.state && event.state.mode) {
        setMode(event.state.mode);
      } else {
        setMode(AppMode.HOME);
      }
      setTimeout(() => { isInternalChange.current = false; }, 50);
    };

    window.history.replaceState({ mode: AppMode.HOME }, "");
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isInternalChange.current) {
      window.history.pushState({ mode }, "");
    }
  }, [mode]);

  const changeMode = (newMode: AppMode) => {
    setMode(newMode);
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('studybuddy_users_db', JSON.stringify(allUsers));
    if (currentUser) {
      const matchingUser = allUsers.find(u => u.id === currentUser.id);
      if (!matchingUser || matchingUser.isBlocked) {
        setCurrentUser(null);
        if (matchingUser?.isBlocked) alert("আপনার অ্যাকাউন্ট ব্লক করা হয়েছে!");
      }
    }
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
      localStorage.setItem('studybuddy_active_user_id', currentUser.id);
    } else {
      localStorage.removeItem('studybuddy_active_user_id');
    }
  }, [currentUser]);

  useEffect(() => localStorage.setItem('studybuddy_admin_profile', JSON.stringify(adminProfile)), [adminProfile]);
  useEffect(() => localStorage.setItem('studybuddy_help', JSON.stringify(helpMessages)), [helpMessages]);
  useEffect(() => localStorage.setItem('studybuddy_is_admin', isAdmin.toString()), [isAdmin]);
  useEffect(() => localStorage.setItem('studybuddy_global_notices_list', JSON.stringify(notices)), [notices]);
  useEffect(() => localStorage.setItem('studybuddy_links', JSON.stringify(studyLinks)), [studyLinks]);
  useEffect(() => {
    if (homeBanner) localStorage.setItem('studybuddy_home_banner_data', homeBanner);
    else localStorage.removeItem('studybuddy_home_banner_data');
  }, [homeBanner]);
  useEffect(() => localStorage.setItem('studybuddy_home_banner_size', homeBannerSize), [homeBannerSize]);

  const addPoints = (pts: number) => currentUser && setCurrentUser(prev => prev ? ({ ...prev, points: prev.points + pts }) : null);
  const updateChallengeCount = () => currentUser && setCurrentUser(prev => prev ? ({ ...prev, dailyChallengeCount: Math.min(prev.dailyChallengeCount + 1, 3) }) : null);
  const handleLogout = () => { setCurrentUser(null); setMode(AppMode.HOME); };

  const userStats = useMemo(() => {
    if (!currentUser) return { level: "Beginner", nextThreshold: 100, progress: 0 };
    const points = currentUser.points;
    let level = "শিক্ষানবিশ (Beginner)";
    let nextThreshold = points < 100 ? 100 : points < 200 ? 200 : points < 500 ? 500 : points < 1000 ? 1000 : 5000;
    if (points >= 1000) level = "লেজেন্ডারি ছাত্র (Legendary)";
    else if (points >= 500) level = "মাস্টারমাইন্ড (Mastermind)";
    else if (points >= 200) level = "অভিযাত্রী (Explorer)";
    else if (points >= 100) level = "উদ্যমী (Active)";
    return { level, nextThreshold, progress: Math.min((points / nextThreshold) * 100, 100) };
  }, [currentUser?.points]);

  const renderHome = () => {
    if (!currentUser) return <AuthView onLogin={setCurrentUser} users={allUsers} setAllUsers={setAllUsers} />;
    const match = homeBannerSize.match(/(\d+)\s*x\s*(\d+)/);
    const bW = match ? parseInt(match[1]) : 728;
    const bH = match ? parseInt(match[2]) : 90;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {homeBanner ? (
          <div className="w-full flex justify-center">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-slate-100 flex items-center justify-center bg-slate-50" style={{ aspectRatio: `${bW}/${bH}`, width: '100%', maxWidth: '100%', maxHeight: bH > bW ? '400px' : 'auto' }}>
              <img src={homeBanner} className="w-full h-full object-contain" alt="Banner" />
            </div>
          </div>
        ) : (
          <div className="bg-indigo-700 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-indigo-900">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Heart className="text-rose-400" fill="currentColor" /></div>
              <div><p className="text-[10px] uppercase font-black opacity-60">প্রকল্প নির্মাতা</p><h4 className="text-lg font-black tracking-tight">রিমন মাহমুদ রোমান</h4></div>
            </div>
            <div className="bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3"><Mail size={16} /><span className="text-sm font-black lowercase text-indigo-50">romantechgp@gmail.com</span></div>
          </div>
        )}

        {notices.length > 0 && (
          <div className="space-y-3 animate-in slide-up">
            {notices.map((n, idx) => (
              <div key={n.id} className="bg-white border-2 border-slate-100 p-5 rounded-[28px] relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-indigo-500' : 'bg-rose-500'} text-white`}><Megaphone size={18} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>নোটিশ #{idx + 1}</span></div>
                    <p className="text-slate-800 font-bold text-sm leading-relaxed">{n.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div onClick={() => changeMode(AppMode.PROFILE)} className="bg-white p-6 sm:p-8 rounded-[40px] shadow-xl shadow-indigo-100/50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all group">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[36px] overflow-hidden border-4 border-white shadow-xl ring-2 ring-indigo-50 group-hover:scale-105 transition-transform">
                {currentUser.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-5xl">{AVATARS[currentUser.points % AVATARS.length]}</div>}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-2xl border-2 border-white shadow-lg"><Zap size={18} fill="currentColor" /></div>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2"><h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser.name}</h2><span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-600 text-white shadow-lg">LVL {Math.floor(currentUser.points / 50) + 1}</span></div>
              <p className="text-sm font-bold text-slate-400 italic mt-1">{userStats.level}</p>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 flex flex-col items-center sm:items-end w-full sm:w-auto">
            <div className="flex items-center gap-2 text-yellow-500 font-black text-3xl"><Trophy size={28} /><span>{currentUser.points}</span></div>
            <div className="mt-2 w-full sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50"><div className="h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" style={{ width: `${userStats.progress}%` }}></div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MenuButton icon={<BookOpen size={28} />} title="সহজ পড়া মোড" color="blue" desc="টপিক গল্পের মতো বুঝে নাও" onClick={() => changeMode(AppMode.STUDY)} />
          <MenuButton icon={<Calculator size={28} />} title="অংক সমাধানকারী" color="purple" desc="অংকের উত্তর ও ব্যাখ্যা" onClick={() => changeMode(AppMode.MATH)} />
          <MenuButton icon={<Languages size={28} />} title="অনুবাদ ও উচ্চারণ" color="green" desc="ভাষা পরিবর্তন করে শেখা" onClick={() => changeMode(AppMode.SPEAKING)} />
          <MenuButton icon={<HelpCircle size={28} />} title="প্রশ্ন ও উত্তর" color="orange" desc="যেকোনো শিক্ষামূলক প্রশ্ন" onClick={() => changeMode(AppMode.QA)} />
          <MenuButton icon={<MessageCircle size={28} />} title="এআই বন্ধু চ্যাট" color="pink" desc="ইংরেজি প্র্যাকটিস করো" onClick={() => changeMode(AppMode.FRIEND_CHAT)} />
          <MenuButton icon={<MessageSquare size={28} />} title="হেল্প লাইন চ্যাট" color="indigo" desc="সরাসরি সাপোর্ট নাও" onClick={() => changeMode(AppMode.HELP_LINE)} />
          <MenuButton icon={<Type size={28} />} title="সঠিক বানান শিখুন" color="cyan" desc="ভুল বানান চেক করো" onClick={() => changeMode(AppMode.SPELLING)} />
        </div>

        <button onClick={() => changeMode(AppMode.GOAL)} className="w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 rounded-[40px] text-white shadow-2xl flex items-center justify-between group hover:scale-[1.01] transition-all border-b-8 border-indigo-900 active:border-b-0 active:translate-y-1">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20 group-hover:rotate-12 transition-transform"><Star size={40} className="text-yellow-400" fill="currentColor" /></div>
            <div className="text-left"><h3 className="text-2xl font-black tracking-tight">আজকের লক্ষ্য</h3><p className="text-indigo-100 font-medium">১০ পয়েন্ট জিততে সঠিক বাক্য বলুন বা লিখুন</p></div>
          </div>
          <div className="text-5xl font-black">{currentUser.dailyChallengeCount}<span className="text-indigo-300/50 text-2xl">/3</span></div>
        </button>

        {studyLinks.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-up">
             <div className="flex items-center gap-4 mb-6"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><LinkIcon size={24} /></div><h3 className="text-xl font-black text-slate-800">গুরুত্বপূর্ণ স্টাডি লিঙ্ক</h3></div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studyLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 group-hover:text-indigo-400 shadow-sm shrink-0"><LinkIcon size={18} /></div><span className="font-black text-sm truncate">{link.title}</span></div>
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
          <div onClick={() => changeMode(AppMode.HOME)} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform"><BookOpen fill="currentColor" size={24} /></div>
            <div><h1 className="text-2xl font-black text-slate-800 tracking-tight">স্টাডিবাডি</h1><p className="text-[11px] font-black text-slate-400">সহজ শিক্ষায় আপনার পাশে</p></div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => changeMode(AppMode.ADMIN)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><ShieldCheck size={22} /></button>
             {currentUser && (
               <button onClick={() => changeMode(AppMode.PROFILE)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-100 bg-white group transition-transform hover:scale-105">
                  {currentUser.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl bg-indigo-50">🎓</div>}
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {(mode !== AppMode.HOME && mode !== AppMode.ADMIN) && (
          <button onClick={() => window.history.back()} className="mb-6 flex items-center gap-2 text-slate-400 font-black hover:text-indigo-600 transition-colors group">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50"><ArrowLeft size={18} /></div>ফিরে যাও
          </button>
        )}
        {mode === AppMode.HOME && renderHome()}
        {mode === AppMode.STUDY && <StudyView setLoading={setLoading} />}
        {mode === AppMode.MATH && <MathView setLoading={setLoading} />}
        {mode === AppMode.SPELLING && <SpellingView setLoading={setLoading} />}
        {mode === AppMode.SPEAKING && <SpeakingView setLoading={setLoading} />}
        {mode === AppMode.QA && <QAView setLoading={setLoading} />}
        {mode === AppMode.FRIEND_CHAT && <FriendChatView setLoading={setLoading} />}
        {mode === AppMode.HELP_LINE && <HelpLineView helpMessages={helpMessages} setHelpMessages={setHelpMessages} userId={currentUser?.id || 'guest'} userName={currentUser?.name || 'User'} isAdmin={isAdmin} adminName={adminProfile.name} />}
        {mode === AppMode.ADMIN && <AdminPanel isAdmin={isAdmin} setIsAdmin={setIsAdmin} setMode={changeMode} helpMessages={helpMessages} setHelpMessages={setHelpMessages} adminProfile={adminProfile} setAdminProfile={setAdminProfile} notices={notices} setNotices={setNotices} studyLinks={studyLinks} setStudyLinks={setStudyLinks} homeBanner={homeBanner} setHomeBanner={setHomeBanner} homeBannerSize={homeBannerSize} setHomeBannerSize={setHomeBannerSize} allUsers={allUsers} setAllUsers={setAllUsers} />}
        {mode === AppMode.GOAL && <GoalView addPoints={addPoints} updateCount={updateChallengeCount} currentCount={currentUser?.dailyChallengeCount || 0} setLoading={setLoading} />}
        {mode === AppMode.PROFILE && <ProfileView profile={currentUser} setProfile={setCurrentUser} stats={userStats} onLogout={handleLogout} />}
      </main>

      <footer className="bg-white border-t p-10 text-center mt-12"><p className="max-w-md mx-auto text-slate-400 font-bold italic text-sm">"প্রতিটি শিশু যেন সহজে AI ব্যবহার করতে পারে তার জন্য এই ক্ষুদ্র প্রয়াস।"</p></footer>
      {loading && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in"><div className="bg-white p-12 rounded-[48px] shadow-2xl flex flex-col items-center"><div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><p className="text-indigo-600 font-black text-2xl mt-8">একটু অপেক্ষা করো...</p></div></div>}
    </div>
  );
};

// ... AuthView and Utilities stay the same as previous large version ...
const AuthView: React.FC<{ onLogin: (user: UserProfile) => void; users: UserProfile[]; setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>; }> = ({ onLogin, users, setAllUsers }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        if (user.isBlocked) return setError('আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে!');
        onLogin(user);
      } else setError('ভুল ইউজার নেম বা পাসওয়ার্ড!');
    } else {
      if (users.some(u => u.username === username)) return setError('ইউজার নেমটি ইতিমধ্যে ব্যবহৃত।');
      if (!username || !password || !name) return setError('সবগুলো ঘর পূরণ করুন!');
      
      const newUser: UserProfile = { 
        id: Date.now().toString(), 
        username, 
        password, 
        name, 
        bio: 'স্টাডিবাডি ইউজ করছি!', 
        points: 0, 
        streak: 0, 
        dailyChallengeCount: 0, 
        lastChallengeDate: new Date().toDateString(), 
        joinDate: new Date().toLocaleDateString('bn-BD'), 
        isBlocked: false 
      };
      setAllUsers(prev => [...prev, newUser]);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in zoom-in">
      <div className="bg-white w-full max-w-md p-10 rounded-[48px] shadow-2xl border border-slate-100 space-y-8 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600">{isLogin ? <LogIn size={40} /> : <UserPlus size={40} />}</div>
        <h2 className="text-3xl font-black text-slate-800">{isLogin ? 'লগইন করুন' : 'সাইন-আপ করুন'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {!isLogin && <div className="space-y-1"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">আপনার নাম</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" placeholder="নাম লিখুন" value={name} onChange={e => setName(e.target.value)} /></div>}
          <div className="space-y-1"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">ইউজার নেম</label><input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" placeholder="আপনার ইউজার নেম" value={username} onChange={e => setUsername(e.target.value)} /></div>
          <div className="space-y-1"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">পাসওয়ার্ড</label><input type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" placeholder="পাসওয়ার্ড দিন" value={password} onChange={e => setPassword(e.target.value)} /></div>
          {error && <p className="text-xs font-bold text-red-500 text-center animate-shake">{error}</p>}<button className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-indigo-700 transition-colors border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1">নিশ্চিত করুন</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-black text-sm hover:underline">{isLogin ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}</button>
      </div>
    </div>
  );
};

const ImagePreview = ({ image, onClear }: { image: string, onClear: () => void }) => (
  <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-slate-50 bg-slate-50 group mb-4"><img src={image} className="w-full h-full object-contain" alt="Preview" /><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><button onClick={onClear} className="p-4 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><X size={24} /></button></div></div>
);

const StudyView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const handleSubmit = async () => { if (!input.trim()) return; setLoading(true); try { const res = await getStudyExplanation(input); setResult(res || 'দুঃখিত!'); } catch (e) { setResult('ভুল হয়েছে।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-blue-50 rounded-3xl text-blue-600"><BookOpen size={32} /></div><h2 className="text-2xl font-black text-slate-800">সহজ পড়া মোড</h2></div><STTButton onResult={setInput} /></div><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[200px] font-bold shadow-inner" placeholder="টপিক..." value={input} onChange={e => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl text-xl hover:bg-blue-700 transition-colors border-b-4 border-blue-900 active:border-b-0 active:translate-y-1"><Send size={20} /> শুরু করো</button>{result && <div className="p-8 bg-blue-50/50 rounded-[32px] border-2 border-blue-100 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up relative"><div className="absolute top-4 right-4"><CopyButton text={result} /></div>{result}</div>}</div>
  );
};

const MathView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setImage(reader.result as string); reader.readAsDataURL(file); } };
  const handleSubmit = async () => { if (!input.trim() && !image) return; setLoading(true); setResult(null); try { const base64Data = image ? image.split(',')[1] : undefined; const res = await solveMath(input, base64Data); setResult(res || 'দুঃখিত!'); } catch (e) { setResult('ভুল হয়েছে।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-purple-50 rounded-3xl text-purple-600"><Calculator size={32} /></div><h2 className="text-2xl font-black text-slate-800">অংক সমাধানকারী</h2></div><div className="flex gap-2"><STTButton onResult={setInput} /><button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"><Camera size={20} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} /></div></div>{image && <ImagePreview image={image} onClear={() => setImage(null)} />}<textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[150px] font-bold shadow-inner" placeholder="অংক..." value={input} onChange={e => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black shadow-xl flex items-center justify-center gap-3 text-xl hover:bg-purple-700 transition-colors border-b-4 border-purple-900 active:border-b-0 active:translate-y-1"><Calculator size={20} /> সমাধান করো</button>{result && <div className="p-8 bg-purple-50/50 rounded-[32px] border-2 border-purple-100 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up relative"><div className="absolute top-4 right-4"><CopyButton text={result} /></div>{result}</div>}</div>
  );
};

/**
 * SpeakingView (Reverted to Toggle Mode)
 */
const SpeakingView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'bn-en' | 'en-bn'>('bn-en');
  const [result, setResult] = useState<{translation: string, pronunciation: string} | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSubmit = async () => { 
    if (!input.trim()) return; 
    setLoading(true); 
    try { 
      const rawRes = await getTranslationAndGuide(input, direction); 
      if (rawRes) { 
        const transMatch = rawRes.match(/TRANSLATION:\s*(.*)/); 
        const pronMatch = rawRes.match(/PRONUNCIATION:\s*(.*)/); 
        if (transMatch) setResult({ translation: transMatch[1].trim(), pronunciation: pronMatch ? pronMatch[1].trim() : '' }); 
      } 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    } 
  };

  const playAudio = async () => { 
    if (!result || isSpeaking) return; 
    setIsSpeaking(true); 
    try { 
      const base64Audio = await getSpeech(direction === 'bn-en' ? result.translation : input); 
      if (base64Audio) { 
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); 
        const ctx = audioContextRef.current; 
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1); 
        const source = ctx.createBufferSource(); 
        source.buffer = audioBuffer; 
        source.connect(ctx.destination); 
        source.onended = () => setIsSpeaking(false); 
        source.start(); 
      } else setIsSpeaking(false); 
    } catch (e) { 
      setIsSpeaking(false); 
    } 
  };

  return (
    <div className="space-y-6 animate-in slide-up">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-3xl text-green-600"><Languages size={32} /></div>
            <h2 className="text-2xl font-black text-slate-800">অনুবাদ</h2>
          </div>
          <div className="flex gap-2">
            <STTButton onResult={setInput} lang={direction === 'bn-en' ? 'bn-BD' : 'en-US'} />
            <button 
              onClick={() => {setDirection(prev => prev === 'bn-en' ? 'en-bn' : 'bn-en'); setResult(null); setInput('');}} 
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-colors uppercase"
            >
              {direction === 'bn-en' ? 'BN → EN' : 'EN → BN'}
            </button>
          </div>
        </div>
        <div className="relative">
          <textarea 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[150px] font-bold shadow-inner" 
            placeholder={direction === 'bn-en' ? "বাংলায় লিখুন..." : "Type in English..."} 
            value={input} 
            onChange={e => setInput(e.target.value)} 
          />
          <button onClick={handleSubmit} disabled={!input.trim()} className="absolute bottom-4 right-4 bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 shadow-lg transition-colors active:scale-95 disabled:opacity-50"><Send size={20} /></button>
        </div>
      </div>
      {result && (
        <div className="bg-white p-6 sm:p-10 rounded-[40px] shadow-2xl border-4 border-green-50 space-y-6 text-center animate-in zoom-in relative">
          <div className="absolute top-4 right-4"><CopyButton text={result.translation} /></div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400">অনুবাদ</span>
            <p className="font-bold text-slate-700 text-xl">{result.translation}</p>
          </div>
          {result.pronunciation && (
            <div className="p-4 bg-slate-50 rounded-2xl"><span className="text-[10px] font-black text-slate-400">উচ্চারণ</span><p className="font-black text-green-700">{result.pronunciation}</p></div>
          )}
          <div className="flex justify-center">
            <button onClick={playAudio} disabled={isSpeaking} className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-md hover:bg-indigo-700 transition-colors">
              {isSpeaking ? <RefreshCw className="animate-spin" size={20} /> : <Volume2 size={24} />} শুনুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SpellingView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [result, setResult] = useState<string | null>(null);
  const handleSubmit = async () => { if (!input.trim()) return; setLoading(true); try { const res = await getSpellingCorrection(input, lang); setResult(res || 'দুঃখিত!'); } catch (e) { setResult('ভুল হয়েছে।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-cyan-50 rounded-3xl text-cyan-600"><Type size={32} /></div><h2 className="text-2xl font-black text-slate-800">বানান শিখুন</h2></div><div className="flex gap-2"><button onClick={() => setLang('bn')} className={`px-4 py-2 rounded-xl font-black text-xs ${lang === 'bn' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>বাংলা</button><button onClick={() => setLang('en')} className={`px-4 py-2 rounded-xl font-black text-xs ${lang === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>ENG</button></div></div><div className="relative"><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[150px] font-bold shadow-inner" placeholder="টেক্সট..." value={input} onChange={e => setInput(e.target.value)} /><div className="absolute bottom-4 right-4"><STTButton onResult={setInput} lang={lang === 'bn' ? 'bn-BD' : 'en-US'} /></div></div><button onClick={handleSubmit} className="w-full bg-cyan-600 text-white py-5 rounded-3xl font-black shadow-xl text-xl flex items-center justify-center gap-3 hover:bg-cyan-700 transition-colors border-b-4 border-cyan-900 active:border-b-0 active:translate-y-1"><Check size={20} /> চেক করো</button>{result && <div className="p-8 bg-cyan-50/50 rounded-[32px] border-2 border-cyan-100 relative text-justify animate-in slide-up">{result}<div className="absolute top-4 right-4"><CopyButton text={result} /></div></div>}</div>
  );
};

const QAView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setImage(reader.result as string); reader.readAsDataURL(file); } };
  const handleSubmit = async () => { if (!input.trim() && !image) return; setLoading(true); try { const base64Data = image ? image.split(',')[1] : undefined; const res = await getQA(input, base64Data); setResult(res || 'দুঃখিত!'); } catch (e) { setResult('ভুল হয়েছে।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-orange-50 rounded-3xl text-orange-600"><HelpCircle size={32} /></div><h2 className="text-2xl font-black text-slate-800">প্রশ্ন ও উত্তর</h2></div><div className="flex gap-2"><STTButton onResult={setInput} /><button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"><Camera size={20} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} /></div></div>{image && <ImagePreview image={image} onClear={() => setImage(null)} />}<textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[150px] font-bold shadow-inner" placeholder="প্রশ্ন..." value={input} onChange={e => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black shadow-xl text-xl flex items-center justify-center gap-3 hover:bg-orange-700 transition-colors border-b-4 border-orange-900 active:border-b-0 active:translate-y-1"><Send size={24} /> উত্তর খোঁজো</button>{result && <div className="p-8 bg-orange-50/50 rounded-[32px] border-2 border-orange-100 whitespace-pre-wrap animate-in slide-up relative"><div className="absolute top-4 right-4"><CopyButton text={result} /></div>{result}</div>}</div>
  );
};

const FriendChatView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{sender: 'user' | 'ai', text: string}[]>([{ sender: 'ai', text: 'আসসালামু আলাইকুম! Hello! I am your AI Study Friend. Let\'s practice English! (চলো ইংরেজি প্র্যাকটিস করি!)' }]);
  const handleSubmit = async () => { if (!input.trim()) return; const userMsg = input; setInput(''); setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]); setLoading(true); try { const history = chatLog.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] })); const res = await chatWithAiFriend(history, userMsg); setChatLog(prev => [...prev, { sender: 'ai', text: res || 'I see!' }]); } catch (e) { setChatLog(prev => [...prev, { sender: 'ai', text: 'Confusion!' }]); } finally { setLoading(false); } };
  return (
    <div className="bg-white rounded-[48px] shadow-xl flex flex-col h-[600px] overflow-hidden border border-slate-100 animate-in slide-up"><div className="p-6 border-b bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black shadow-sm">AI</div><h3 className="font-black">এআই বন্ধু</h3></div><STTButton onResult={setInput} lang="en-US" /></div><div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">{chatLog.map((msg, i) => (<div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-up`}><div className={`max-w-[85%] p-4 rounded-[24px] font-bold text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>{msg.text}</div></div>))}</div><div className="p-6 bg-white border-t flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"><input className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" placeholder="ইংরেজিতে লিখুন..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} /><button onClick={handleSubmit} className="bg-pink-500 text-white p-4 rounded-2xl hover:bg-pink-600 active:scale-90 shadow-lg transition-all"><Send size={24} /></button></div></div>
  );
};

const HelpLineView = ({ helpMessages, setHelpMessages, userId, userName, isAdmin, adminName }: any) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [helpMessages]);

  const handleSendMessage = () => { if (!input.trim()) return; setHelpMessages((prev: any) => [...prev, { id: Date.now().toString(), userId, userName: isAdmin ? adminName : userName, text: input, timestamp: Date.now(), isAdmin }]); setInput(''); };
  
  return (
    <div className="bg-white rounded-[48px] shadow-xl flex flex-col h-[600px] overflow-hidden border border-slate-100 animate-in slide-up">
      <div className="p-6 border-b bg-indigo-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3"><MessageCircle size={24} /><h3 className="font-black">হেল্প লাইন চ্যাট</h3></div>
        <STTButton onResult={setInput} />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 custom-scrollbar">
        {helpMessages.filter((m: any) => isAdmin || m.userId === userId).map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.isAdmin === isAdmin ? 'justify-end' : 'justify-start'} animate-in slide-up`}>
            <div className={`max-w-[85%] p-4 rounded-[24px] font-bold text-sm shadow-sm ${msg.isAdmin === isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
              <div className="text-[9px] font-black opacity-60 mb-1 uppercase tracking-tighter">{msg.userName}</div>
              {msg.text}
            </div>
          </div>
        ))}
        {helpMessages.filter((m: any) => isAdmin || m.userId === userId).length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-60 italic text-center px-10">
            <div className="p-6 bg-slate-100 rounded-full mb-4"><MessageSquare size={48} /></div>
            <p className="font-bold">এডমিনের সাথে সরাসরি কথা বলতে মেসেজ লিখুন।</p>
          </div>
        )}
      </div>
      <div className="p-6 bg-white border-t flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <input className="flex-1 bg-slate-100 rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" placeholder="এখানে মেসেজ লিখুন..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
        <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 active:scale-90 shadow-lg transition-all"><Send size={24} /></button>
      </div>
    </div>
  );
};

const AdminPanel = ({ isAdmin, setIsAdmin, setMode, helpMessages, setHelpMessages, adminProfile, setAdminProfile, notices, setNotices, studyLinks, setStudyLinks, homeBanner, setHomeBanner, homeBannerSize, setHomeBannerSize, allUsers, setAllUsers }: any) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'messages' | 'notice' | 'links' | 'banner'>('dashboard');
  const [noticeInput, setNoticeInput] = useState('');
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [visiblePass, setVisiblePass] = useState<Record<string, boolean>>({});
  const bannerRef = useRef<HTMLInputElement>(null);
  const [linkT, setLinkT] = useState('');
  const [linkU, setLinkU] = useState('');

  // Admin Chat State
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');

  const handleLogin = () => (id === 'romantechgp@gmail.com' || id === '01617365471') && pass === '13457@Hunter' ? setIsAdmin(true) : setError('ভুল অ্যাডমিন তথ্য!');
  const handleAddNotice = () => { if (!noticeInput.trim() || notices.length >= 3) return; setNotices([{ id: Date.now().toString(), text: noticeInput, timestamp: Date.now() }, ...notices]); setNoticeInput(''); setPublishMsg('নোটিশ আপডেটেড!'); setTimeout(() => setPublishMsg(null), 3000); };
  const handleBanner = (e: any) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => { setHomeBanner(r.result as string); setPublishMsg('ব্যানার আপডেটেড!'); setTimeout(() => setPublishMsg(null), 3000); }; r.readAsDataURL(f); } };
  const handleAddLink = () => { if (!linkT.trim() || !linkU.trim()) return; setStudyLinks([{ id: Date.now().toString(), title: linkT, url: linkU, date: new Date().toLocaleDateString() }, ...studyLinks]); setLinkT(''); setLinkU(''); setPublishMsg('লিঙ্ক অ্যাডেড!'); setTimeout(() => setPublishMsg(null), 3000); };
  
  const handleResetPassword = (userId: string) => {
    const newPassword = window.prompt("এই ইউজারটির জন্য নতুন একটি পাসওয়ার্ড লিখুন:");
    if (newPassword && newPassword.trim()) {
      setAllUsers((prev: UserProfile[]) => prev.map(u => u.id === userId ? { ...u, password: newPassword.trim() } : u));
      setPublishMsg("ইউজারের পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!");
      setTimeout(() => setPublishMsg(null), 3000);
    }
  };

  const sendAdminReply = () => {
    if (!adminReplyInput.trim() || !selectedChatUserId) return;
    setHelpMessages((prev: HelpMessage[]) => [...prev, {
      id: Date.now().toString(),
      userId: selectedChatUserId,
      userName: adminProfile.name,
      text: adminReplyInput,
      timestamp: Date.now(),
      isAdmin: true
    }]);
    setAdminReplyInput('');
  };

  const conversationGroups = useMemo(() => {
    const groups: Record<string, { lastMessage: HelpMessage, count: number, userName: string }> = {};
    helpMessages.forEach((m: HelpMessage) => {
      if (!groups[m.userId] || m.timestamp > groups[m.userId].lastMessage.timestamp) {
        let userName = m.userName;
        if (m.isAdmin) {
          const userMsg = helpMessages.find(hm => hm.userId === m.userId && !hm.isAdmin);
          if (userMsg) userName = userMsg.userName;
        }
        groups[m.userId] = { lastMessage: m, count: (groups[m.userId]?.count || 0) + 1, userName: userName };
      } else {
        groups[m.userId].count++;
      }
    });
    return Object.entries(groups).sort((a, b) => b[1].lastMessage.timestamp - a[1].lastMessage.timestamp);
  }, [helpMessages]);

  if (isAdmin) {
    const totalPoints = allUsers.reduce((a: number, u: any) => a + u.points, 0);
    const challengesToday = allUsers.reduce((a: number, u: any) => a + u.dailyChallengeCount, 0);
    return (
      <div className="space-y-6 animate-in zoom-in">
        <div className="bg-red-50 border-l-8 border-red-500 p-6 rounded-2xl shadow-sm"><h4 className="text-red-700 font-black">অ্যাডমিন মোড: রিমন মাহমুদ রোমান</h4></div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm flex gap-2 overflow-x-auto no-scrollbar border border-slate-100">
          {['dashboard', 'users', 'messages', 'notice', 'links', 'banner'].map((t: any) => (
            <button key={t} onClick={() => { setActiveTab(t); if(t !== 'messages') setSelectedChatUserId(null); }} className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>
          ))}
          <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-600 px-5 py-2 rounded-xl font-black text-xs uppercase ml-auto hover:bg-red-100 transition-colors">LOGOUT</button>
        </div>
        {publishMsg && <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-bold animate-in zoom-in">{publishMsg}</div>}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in slide-up">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-2"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><Users size={20} /></div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">মোট ইউজার</p><p className="text-3xl font-black text-slate-800">{allUsers.length}</p></div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-2"><div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner"><Zap size={20} /></div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">আজকের লক্ষ্য</p><p className="text-3xl font-black text-slate-800">{challengesToday}</p></div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-2"><div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shadow-inner"><Star size={20} /></div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">মোট পয়েন্ট</p><p className="text-3xl font-black text-slate-800">{totalPoints}</p></div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 overflow-x-auto animate-in slide-up">
            <h3 className="text-xl font-black mb-6 text-slate-800">ইউজার ডাটাবেস</h3>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest"><tr className="border-b"><th className="p-4">ইউজার</th><th className="p-4">ইউজার নেম</th><th className="p-4">পাসওয়ার্ড</th><th className="p-4">পয়েন্ট</th><th className="p-4">অ্যাকশন</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map(u => (
                  <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${u.isBlocked ? 'bg-red-50/30' : ''}`}>
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center font-black text-xs text-indigo-600 shadow-inner">{u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover rounded-lg" /> : u.name.charAt(0)}</div><span className="font-bold text-sm text-slate-700">{u.name}</span></div></td>
                    <td className="p-4 text-xs font-black text-slate-400">{u.username}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-600 shadow-inner">{visiblePass[u.id] ? (u.password || 'No Pass') : '••••••••'}</span>
                        <button onClick={() => setVisiblePass(p => ({ ...p, [u.id]: !p[u.id] }))} className="text-slate-300 hover:text-indigo-600 transition-colors">{visiblePass[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      </div>
                    </td>
                    <td className="p-4 text-indigo-600 font-black">{u.points}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleResetPassword(u.id)} className="p-2 bg-white text-slate-400 border border-slate-100 rounded-lg hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"><Key size={16} /></button>
                        <button onClick={() => setAllUsers(prev => prev.map(item => item.id === u.id ? { ...item, isBlocked: !item.isBlocked } : item))} className={`p-2 rounded-lg border transition-all ${u.isBlocked ? 'bg-red-600 text-white border-red-700 shadow-md' : 'text-slate-400 border-slate-100 hover:text-red-500 hover:border-red-100 shadow-sm'}`}>{u.isBlocked ? <ShieldOff size={16} /> : <ShieldAlert size={16} />}</button>
                        <button onClick={() => confirm('ইউজারটিকে কি ডিলিট করতে চান?') && setAllUsers(prev => prev.filter(item => item.id !== u.id))} className="p-2 text-slate-300 border border-slate-100 rounded-lg hover:text-red-600 hover:border-red-100 transition-all shadow-sm"><UserX size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-[600px] flex overflow-hidden animate-in slide-up">
            <div className={`w-full md:w-80 border-r flex flex-col ${selectedChatUserId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 border-b bg-slate-50">
                <h3 className="text-lg font-black text-slate-800">চ্যাট লিস্ট</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">সক্রিয় ইউজার কথোপকথন</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversationGroups.map(([uid, data]) => (
                  <button 
                    key={uid} 
                    onClick={() => setSelectedChatUserId(uid)}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-indigo-50 transition-colors border-b border-slate-50 text-left ${selectedChatUserId === uid ? 'bg-indigo-50 border-r-4 border-r-indigo-600' : ''}`}
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 shrink-0 shadow-inner">{data.userName.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-slate-800 text-sm truncate">{data.userName}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(data.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{data.lastMessage.isAdmin ? "আপনি: " : ""}{data.lastMessage.text}</p>
                    </div>
                  </button>
                ))}
                {conversationGroups.length === 0 && <div className="p-10 text-center text-slate-300 italic font-bold">কোনো মেসেজ নেই</div>}
              </div>
            </div>
            <div className={`flex-1 flex flex-col ${!selectedChatUserId ? 'hidden md:flex items-center justify-center bg-slate-50/30' : 'flex'}`}>
              {selectedChatUserId ? (
                <>
                  <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedChatUserId(null)} className="p-2 hover:bg-slate-100 rounded-xl md:hidden"><ArrowLeft size={20} /></button>
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
                        {conversationGroups.find(g => g[0] === selectedChatUserId)?.[1].userName.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{conversationGroups.find(g => g[0] === selectedChatUserId)?.[1].userName}</h4>
                        <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Active Chat</p>
                      </div>
                    </div>
                    <button onClick={() => confirm('চ্যাট ডিলিট?') && setHelpMessages(helpMessages.filter((m: HelpMessage) => m.userId !== selectedChatUserId))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 custom-scrollbar">
                    {helpMessages.filter((m: HelpMessage) => m.userId === selectedChatUserId).map((m: HelpMessage) => (
                      <div key={m.id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'} animate-in slide-up`}>
                        <div className={`max-w-[80%] p-4 rounded-[24px] font-bold text-sm shadow-sm ${m.isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                          <div className="text-[9px] font-black opacity-60 mb-1 uppercase tracking-tighter">{m.isAdmin ? "আপনি (Admin)" : m.userName}</div>
                          {m.text}
                          <div className="text-[8px] opacity-40 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white border-t flex gap-3 shadow-inner">
                    <input className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 outline-none font-bold text-sm" placeholder="ইউজারকে রিপ্লাই লিখুন..." value={adminReplyInput} onChange={e => setAdminReplyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAdminReply()} />
                    <button onClick={sendAdminReply} className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 active:scale-90 shadow-lg transition-all"><Send size={20} /></button>
                  </div>
                </>
              ) : (
                <div className="text-center p-10 space-y-4 opacity-50 grayscale">
                  <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto"><MessageCircle size={48} className="text-slate-400" /></div>
                  <h4 className="text-xl font-black text-slate-800">মেসেজ সিলেক্ট করুন</h4>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Rest of AdminTabs stay similar: notice, banner, links */}
        {activeTab === 'notice' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up">
            <div className="space-y-1"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">নতুন নোটিশ ({notices.length}/3)</label><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none font-bold shadow-inner min-h-[120px]" placeholder="নোটিশের লেখাটি লিখুন..." value={noticeInput} onChange={e => setNoticeInput(e.target.value)} disabled={notices.length >= 3} /></div>
            <button onClick={handleAddNotice} disabled={notices.length >= 3 || !noticeInput.trim()} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">যোগ করো</button>
            <div className="space-y-3">{notices.map((n, i) => (<div key={n.id} className="p-5 bg-slate-50 rounded-2xl border flex justify-between items-center shadow-sm animate-in slide-up"><div className="flex gap-4 items-center"><span className="w-6 h-6 bg-white rounded-full flex items-center justify-center font-black text-xs text-indigo-600 border shadow-inner">{i+1}</span><p className="font-bold text-slate-700 text-sm">{n.text}</p></div><button onClick={() => setNotices(prev => prev.filter(item => item.id !== n.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button></div>))}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[48px] shadow-2xl max-w-md mx-auto space-y-8 border animate-in slide-up border-slate-100">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 shadow-inner"><ShieldCheck size={40} /></div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">অ্যাডমিন প্রবেশ</h2>
      </div>
      <div className="space-y-5">
        <div className="space-y-1"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">আইডি</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" value={id} onChange={e => setId(e.target.value)} /></div>
        <div className="space-y-1"><label className="text-[11px] font-black text-slate-400 uppercase ml-4">পাসওয়ার্ড</label><input type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" value={pass} onChange={e => setPass(e.target.value)} /></div>
        {error && <p className="text-xs font-bold text-red-500 text-center animate-shake">{error}</p>}<button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all hover:bg-indigo-700 border-b-4 border-indigo-900 active:border-b-0">লগইন</button>
      </div>
    </div>
  );
};

const ProfileView = ({ profile, setProfile, stats, onLogout }: any) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const handlePhoto = (e: any) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setProfile((p: any) => ({ ...p, photoUrl: r.result as string })); r.readAsDataURL(f); } };
  if (!profile) return null;
  return (
    <div className="space-y-8 animate-in slide-up">
      <div className="bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 flex flex-col items-center space-y-6">
        <div className="relative"><div className="w-32 h-32 bg-indigo-50 rounded-[40px] overflow-hidden border-4 border-white shadow-xl shadow-indigo-100/50">{profile.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>}</div><button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl border-2 border-white shadow-lg hover:bg-indigo-700 transition-all"><Camera size={18} /></button><input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handlePhoto} /></div>
        <div className="text-center space-y-1"><h2 className="text-4xl font-black text-slate-800 tracking-tight">{profile.name}</h2><div className="flex gap-3 justify-center"><span className="bg-indigo-600 text-white px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">{stats.level}</span><span className="bg-yellow-100 text-yellow-700 px-5 py-1.5 rounded-xl text-[10px] font-black border border-yellow-200 shadow-sm uppercase tracking-widest">{profile.points} PTS</span></div></div>
      </div>
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-tighter">আপনার নাম</label><input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none shadow-inner text-slate-700" value={profile.name} onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-tighter">আপনার সম্পর্কে (BIO)</label><textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold min-h-[120px] outline-none shadow-inner text-slate-700" value={profile.bio} onChange={e => setProfile((p: any) => ({ ...p, bio: e.target.value }))} /></div>
          <button onClick={onLogout} className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-red-100 transition-colors border border-red-100 mt-4"><LogOut size={18} /> লগআউট করুন</button>
        </div>
      </div>
    </div>
  );
};

const GoalView = ({ addPoints, updateCount, currentCount, setLoading }: any) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimable, setClaimable] = useState(false);
  const handleCheck = async () => { if (!input.trim()) return; setLoading(true); setFeedback(null); try { const res = await checkDailyGoal(input); if (res?.toUpperCase().includes('SUCCESS')) { setIsSuccess(true); setClaimable(true); setFeedback('চমৎকার! সঠিক বাক্য। রিওয়ার্ড গ্রহণ করুন।'); } else setFeedback(res || 'ভুল বাক্য!'); } catch (e) { setFeedback('ভুল হয়েছে।'); } finally { setLoading(false); } };
  const claim = () => { addPoints(10); updateCount(); setClaimable(false); setIsSuccess(false); setFeedback('অভিনন্দন! ১০ পয়েন্ট জয়ী!'); setInput(''); };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-up">
      <div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-yellow-50 rounded-3xl text-yellow-600 border border-yellow-100 shadow-inner"><Star size={32} fill="currentColor" /></div><h2 className="text-2xl font-black text-slate-800 tracking-tight">আজকের লক্ষ্য</h2></div><div className="bg-indigo-50 px-6 py-3 rounded-2xl shadow-inner border border-indigo-100"><span className="text-3xl font-black text-indigo-600">{currentCount}</span><span className="text-indigo-300 font-bold ml-1">/ 3</span></div></div>
      {currentCount >= 3 ? <div className="p-16 bg-green-50 rounded-[48px] text-center font-black text-green-800 text-2xl border-4 border-dashed border-green-200 animate-in zoom-in">🎉 সব লক্ষ্য পূর্ণ হয়েছে!</div> : (
        <div className="space-y-6">
          <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] p-8 outline-none font-bold text-lg shadow-inner text-slate-700 min-h-[160px]" placeholder="ইংরেজিতে একটি সঠিক বাক্য লিখুন..." value={input} onChange={e => setInput(e.target.value)} />
          <button onClick={handleCheck} disabled={!input.trim() || claimable} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1">চেক করো</button>
          {feedback && <div className={`p-8 rounded-[32px] border-2 font-bold text-sm animate-in zoom-in leading-relaxed ${isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>{feedback}</div>}
          {claimable && <button onClick={claim} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-7 rounded-3xl font-black text-xl shadow-2xl animate-bounce-short uppercase tracking-widest border-b-8 border-orange-700">পুরস্কার গ্রহণ করো (+১০)</button>}
        </div>
      )}
    </div>
  );
};

export default App;
