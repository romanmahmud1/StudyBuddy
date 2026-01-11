
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
  Eye,
  EyeOff,
  PenLine,
  FileText
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
  getSpellingCorrection,
  getScriptContent
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
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'cyan' | 'rose' | 'amber';
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
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100",
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
          <MenuButton icon={<PenLine size={28} />} title="স্ক্রিপ্ট লিখে নাও" color="rose" desc="চমৎকার চিত্রনাট্য তৈরি করো" onClick={() => changeMode(AppMode.SCRIPT_WRITER)} />
          <MenuButton icon={<MessageCircle size={28} />} title="এআই বন্ধু চ্যাট" color="pink" desc="ইংরেজি প্র্যাকটিস করো" onClick={() => changeMode(AppMode.FRIEND_CHAT)} />
          <MenuButton icon={<Type size={28} />} title="সঠিক বানান শিখুন" color="cyan" desc="ভুল বানান চেক করো" onClick={() => changeMode(AppMode.SPELLING)} />
          <MenuButton icon={<MessageSquare size={28} />} title="হেল্প লাইন চ্যাট" color="indigo" desc="সরাসরি সাপোর্ট নাও" onClick={() => changeMode(AppMode.HELP_LINE)} />
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
        {mode === AppMode.SCRIPT_WRITER && <ScriptWriterView setLoading={setLoading} />}
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
  const handleSubmit = async () => { if (!input.trim() && !image) return; setLoading(true); try { const base64Data = image ? image.split(',')[1] : undefined; const res = await solveMath(input, base64Data); setResult(res || 'দুঃখিত!'); } catch (e) { setResult('ভুল হয়েছে।'); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-4 bg-purple-50 rounded-3xl text-purple-600"><Calculator size={32} /></div><h2 className="text-2xl font-black text-slate-800">অংক সমাধানকারী</h2></div><div className="flex gap-2"><STTButton onResult={setInput} /><button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"><Camera size={20} /></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} /></div></div>{image && <ImagePreview image={image} onClear={() => setImage(null)} />}<textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[150px] font-bold shadow-inner" placeholder="অংক..." value={input} onChange={e => setInput(e.target.value)} /><button onClick={handleSubmit} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black shadow-xl flex items-center justify-center gap-3 text-xl hover:bg-purple-700 transition-colors border-b-4 border-purple-900 active:border-b-0 active:translate-y-1"><Calculator size={20} /> সমাধান করো</button>{result && <div className="p-8 bg-purple-50/50 rounded-[32px] border-2 border-purple-100 whitespace-pre-wrap leading-relaxed shadow-sm font-medium animate-in slide-up relative"><div className="absolute top-4 right-4"><CopyButton text={result} /></div>{result}</div>}</div>
  );
};

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

const ScriptWriterView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [result, setResult] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('পুরো স্ক্রিপ্ট কপি করো');

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await getScriptContent(input, lang);
      setResult(res || 'দুঃখিত, স্ক্রিপ্ট তৈরি করা যায়নি।');
    } catch (e) {
      setResult('ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopyStatus('কপি করা হয়েছে!');
    setTimeout(() => setCopyStatus('পুরো স্ক্রিপ্ট কপি করো'), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-rose-50 rounded-3xl text-rose-600 border border-rose-100 shadow-inner">
            <PenLine size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">স্ক্রিপ্ট লিখে নাও</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setLang('bn')} 
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${lang === 'bn' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-rose-600'}`}
          >
            বাংলা
          </button>
          <button 
            onClick={() => setLang('en')} 
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${lang === 'en' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-rose-600'}`}
          >
            English
          </button>
        </div>
      </div>
      <div className="relative">
        <textarea 
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[180px] font-bold shadow-inner text-slate-700" 
          placeholder="কোন টপিক বা বিষয়ের ওপর স্ক্রিপ্ট চান তা এখানে লিখুন..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
        />
        <div className="absolute bottom-4 right-4">
          <STTButton onResult={setInput} lang={lang === 'bn' ? 'bn-BD' : 'en-US'} />
        </div>
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={!input.trim()}
        className="w-full bg-rose-600 text-white py-5 rounded-3xl font-black shadow-xl text-xl flex items-center justify-center gap-3 hover:bg-rose-700 transition-colors border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 disabled:opacity-50"
      >
        <FileText size={20} /> স্ক্রিপ্ট তৈরি করো
      </button>
      {result && (
        <div className="p-8 bg-rose-50/50 rounded-[32px] border-2 border-rose-100 relative animate-in slide-up space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">তৈরিকৃত স্ক্রিপ্ট</span>
            <CopyButton text={result} />
          </div>
          <div className="whitespace-pre-wrap leading-relaxed font-medium text-slate-700 bg-white/50 p-6 rounded-2xl border border-rose-50 shadow-inner">{result}</div>
          <button 
            onClick={handleCopyAll}
            className="w-full py-4 bg-white border-2 border-rose-200 rounded-2xl text-rose-600 font-black text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Copy size={18} /> {copyStatus}
          </button>
        </div>
      )}
    </div>
  );
};

const FriendChatView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const userMsg: { role: 'user', parts: [{ text: string }] } = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: m.parts }));
      const response = await chatWithAiFriend(history, input);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response || '' }] }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[600px] animate-in slide-up">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="p-4 bg-pink-50 rounded-3xl text-pink-600"><MessageCircle size={32} /></div>
        <h2 className="text-2xl font-black text-slate-800">এআই বন্ধু চ্যাট</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 p-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-400 font-bold italic">
            "হাই! আমি তোমার স্টাডিবাডি। আমার সাথে ইংরেজিতে কথা বলো, আমি তোমার ভুল শুধরে দেবো!"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl font-bold shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
              {m.parts[0].text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 shrink-0">
        <input 
          className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold" 
          placeholder="ইংরেজি প্র্যাকটিস করো..." 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <STTButton onResult={setInput} lang="en-US" />
        <button onClick={handleSubmit} className="p-4 bg-pink-600 text-white rounded-2xl shadow-lg hover:bg-pink-700 transition-all"><Send size={20} /></button>
      </div>
    </div>
  );
};

const HelpLineView = ({ helpMessages, setHelpMessages, userId, userName, isAdmin, adminName }: any) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [helpMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: HelpMessage = {
      id: Date.now().toString(),
      userId,
      userName: isAdmin ? adminName : userName,
      text: input,
      timestamp: Date.now(),
      isAdmin
    };
    setHelpMessages([...helpMessages, newMessage]);
    setInput('');
  };

  const filteredMessages = isAdmin ? helpMessages : helpMessages.filter((m: HelpMessage) => m.userId === userId);

  return (
    <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[600px] animate-in slide-up">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600"><MessageSquare size={32} /></div>
        <h2 className="text-2xl font-black text-slate-800">হেল্প লাইন</h2>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6 p-2">
        {filteredMessages.map((m: HelpMessage) => (
          <div key={m.id} className={`flex flex-col ${m.isAdmin === isAdmin ? 'items-end' : 'items-start'}`}>
             <span className="text-[10px] font-black text-slate-400 mb-1 px-2">{m.userName}</span>
             <div className={`max-w-[80%] p-4 rounded-3xl font-bold shadow-sm ${m.isAdmin === isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {m.text}
             </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 shrink-0">
        <input className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="আপনার সমস্যাটি লিখুন..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"><Send size={20} /></button>
      </div>
    </div>
  );
};

const AdminPanel = ({ isAdmin, setIsAdmin, setMode, helpMessages, setHelpMessages, adminProfile, setAdminProfile, notices, setNotices, studyLinks, setStudyLinks, homeBanner, setHomeBanner, homeBannerSize, setHomeBannerSize, allUsers, setAllUsers }: any) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(isAdmin);
  const [noticeInput, setNoticeInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsUnlocked(true);
      setIsAdmin(true);
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 max-w-md mx-auto text-center space-y-8 animate-in zoom-in">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600"><Key size={40} /></div>
        <h2 className="text-3xl font-black text-slate-800">অ্যাডমিন লগইন</h2>
        <form onSubmit={handleUnlock} className="space-y-6">
          <input type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="পাসওয়ার্ড লিখুন" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1">লগইন</button>
        </form>
      </div>
    );
  }

  const addNotice = () => {
    if (!noticeInput.trim()) return;
    setNotices([...notices, { id: Date.now().toString(), text: noticeInput, timestamp: Date.now() }]);
    setNoticeInput('');
  };

  const addLink = () => {
    if (!linkTitle || !linkUrl) return;
    setStudyLinks([...studyLinks, { id: Date.now().toString(), title: linkTitle, url: linkUrl, date: new Date().toLocaleDateString() }]);
    setLinkTitle(''); setLinkUrl('');
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setHomeBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleUserBlock = (id: string) => {
    setAllUsers((prev: UserProfile[]) => prev.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  return (
    <div className="space-y-8 animate-in slide-up">
      <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl"><ShieldCheck size={32} /></div>
          <div><h2 className="text-2xl font-black">অ্যাডমিন প্যানেল</h2><p className="opacity-70 font-bold">ম্যানেজমেন্ট কন্ট্রোল</p></div>
        </div>
        <button onClick={() => { setIsAdmin(false); setMode(AppMode.HOME); }} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-colors"><LogOut size={24} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Megaphone size={20} className="text-indigo-600" /> নোটিশ বোর্ড</h3>
          <div className="flex gap-2">
            <input className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none font-bold" placeholder="নতুন নোটিশ..." value={noticeInput} onChange={e => setNoticeInput(e.target.value)} />
            <button onClick={addNotice} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md"><PlusCircle size={20} /></button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {notices.map((n: Notice) => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group">
                <p className="text-sm font-bold text-slate-700">{n.text}</p>
                <button onClick={() => setNotices(notices.filter((not: Notice) => not.id !== n.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><LinkIcon size={20} className="text-indigo-600" /> স্টাডি লিঙ্ক</h3>
          <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none font-bold" placeholder="শিরোনাম" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
          <div className="flex gap-2">
            <input className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none font-bold" placeholder="URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
            <button onClick={addLink} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md"><PlusCircle size={20} /></button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {studyLinks.map((l: StudyLink) => (
              <div key={l.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group">
                <span className="text-sm font-bold text-slate-700 truncate mr-4">{l.title}</span>
                <button onClick={() => setStudyLinks(studyLinks.filter((lnk: StudyLink) => lnk.id !== l.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Settings size={20} className="text-indigo-600" /> হোম ব্যানার</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {BANNER_SIZES.map(s => (
                <button key={s} onClick={() => setHomeBannerSize(s)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${homeBannerSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{s}</button>
              ))}
            </div>
            <div className="relative border-4 border-dashed border-slate-100 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleBannerUpload} />
              <div className="flex flex-col items-center gap-2">
                <Camera size={32} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                <span className="text-xs font-black text-slate-400">আপলোড ইমেজ</span>
              </div>
            </div>
            {homeBanner && (
              <div className="relative rounded-2xl overflow-hidden group border border-slate-100">
                <img src={homeBanner} className="w-full h-20 object-cover" />
                <button onClick={() => setHomeBanner(null)} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 size={20} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Users size={20} className="text-indigo-600" /> ইউজার ম্যানেজমেন্ট</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {allUsers.map((u: UserProfile) => (
              <div key={u.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg">{AVATARS[u.points % AVATARS.length]}</div>
                  <div><p className="text-sm font-black text-slate-700">{u.name}</p><p className="text-[10px] text-slate-400 font-bold">@{u.username} • {u.points} pts</p></div>
                </div>
                <button onClick={() => toggleUserBlock(u.id)} className={`p-2 rounded-xl transition-colors ${u.isBlocked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:text-red-500'}`}>{u.isBlocked ? <ShieldAlert size={18} /> : <ShieldOff size={18} />}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalView = ({ addPoints, updateCount, currentCount, setLoading }: any) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim() || currentCount >= 3) return;
    setLoading(true);
    try {
      const res = await checkDailyGoal(input);
      if (res?.includes("SUCCESS")) {
        addPoints(10);
        updateCount();
        setResult("অসাধারণ! তুমি ১০ পয়েন্ট জিতেছো।");
        setInput('');
      } else {
        setResult(res || "ভুল হয়েছে, আবার চেষ্টা করো!");
      }
    } catch (e) {
      setResult("দুঃখিত, কোনো সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-up text-center">
      <div className="w-24 h-24 bg-yellow-50 rounded-[36px] flex items-center justify-center mx-auto text-yellow-500 shadow-inner border border-yellow-100"><Star size={48} fill="currentColor" /></div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-800">আজকের লক্ষ্য</h2>
        <p className="text-slate-400 font-bold max-w-sm mx-auto">একটি ইংরেজি বাক্য বলুন বা লিখুন। সঠিক হলে ১০ পয়েন্ট বোনাস!</p>
      </div>
      <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আজকের অগ্রগতি</span>
          <span className="text-xl font-black text-indigo-600">{currentCount}/3</span>
        </div>
        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(currentCount / 3) * 100}%` }}></div>
        </div>
      </div>
      <div className="relative">
        <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 outline-none min-h-[120px] font-bold shadow-inner text-center text-xl" placeholder="আপনার বাক্যটি লিখুন..." value={input} onChange={e => setInput(e.target.value)} disabled={currentCount >= 3} />
        <div className="absolute bottom-4 right-4"><STTButton onResult={setInput} lang="en-US" /></div>
      </div>
      <button onClick={handleSubmit} disabled={!input.trim() || currentCount >= 3} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-colors border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 disabled:opacity-50">চেক করুন ও পয়েন্ট জিতুন</button>
      {result && <div className={`p-6 rounded-3xl font-bold ${result.includes('অসাধারণ') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'} border animate-in zoom-in`}>{result}</div>}
      {currentCount >= 3 && <p className="text-indigo-600 font-black italic">"অভিনন্দন! আজকের সকল লক্ষ্য পূরণ হয়েছে।"</p>}
    </div>
  );
};

const ProfileView = ({ profile, setProfile, stats, onLogout }: any) => {
  if (!profile) return null;

  return (
    <div className="space-y-8 animate-in slide-up">
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>
        <div className="relative pt-8">
           <div className="w-32 h-32 rounded-[48px] border-8 border-white shadow-2xl mx-auto overflow-hidden bg-white mb-6">
              {profile.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl bg-indigo-50">{AVATARS[profile.points % AVATARS.length]}</div>}
           </div>
           <h2 className="text-3xl font-black text-slate-800">{profile.name}</h2>
           <p className="text-slate-400 font-bold italic mt-1">@{profile.username}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-10">
          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
             <Trophy className="mx-auto text-indigo-600 mb-2" size={24} />
             <p className="text-xl font-black text-indigo-900">{profile.points}</p>
             <p className="text-[10px] font-black text-indigo-400 uppercase">পয়েন্ট</p>
          </div>
          <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
             <TrendingUp className="mx-auto text-rose-600 mb-2" size={24} />
             <p className="text-xl font-black text-rose-900">{profile.streak || 0}</p>
             <p className="text-[10px] font-black text-rose-400 uppercase">স্ট্রাইক</p>
          </div>
          <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
             <Award className="mx-auto text-amber-600 mb-2" size={24} />
             <p className="text-xl font-black text-amber-900">{Math.floor(profile.points / 50) + 1}</p>
             <p className="text-[10px] font-black text-amber-400 uppercase">লেভেল</p>
          </div>
        </div>

        <div className="mt-10 p-8 bg-slate-50 rounded-[40px] border border-slate-100 text-left">
           <h4 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Info size={16} /> স্ট্যাটিস্টিকস</h4>
           <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-black text-slate-600 mb-2"><span>র‍্যাঙ্ক: {stats.level}</span><span>{profile.points}/{stats.nextThreshold}</span></div>
                <div className="w-full h-4 bg-white rounded-full border border-slate-200 p-0.5 shadow-inner"><div className="h-full bg-indigo-600 rounded-full transition-all shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${stats.progress}%` }}></div></div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 font-bold">
                <Clock size={18} className="text-indigo-400" />
                <span>যোগদান করেছেন: {profile.joinDate}</span>
              </div>
           </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={onLogout} className="flex-1 bg-rose-50 text-rose-600 py-5 rounded-[28px] font-black shadow-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-100"><LogOut size={20} /> লগ আউট</button>
        </div>
      </div>
    </div>
  );
};

export default App;
