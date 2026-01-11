
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
  Users, 
  X, 
  Megaphone, 
  Trash2, 
  ExternalLink, 
  PlusCircle, 
  Link as LinkIcon, 
  LogIn, 
  LogOut, 
  UserPlus, 
  ShieldAlert, 
  ShieldOff, 
  Key, 
  Info, 
  Type, 
  PenLine, 
  FileText, 
  Settings, 
  Activity, 
  User, 
  LayoutDashboard, 
  Shield, 
  Sparkles, 
  Edit3, 
  Save, 
  Calendar, 
  Medal, 
  Code, 
  Terminal, 
  Image as ImageIcon, 
  Quote,
  Gift,
  Layout,
  AlertTriangle
} from 'lucide-react';
import { AppMode, UserProfile, HelpMessage, AdminProfile, StudyLink, Notice, AdminPost } from './types';
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

const AVATARS = ['🎓', '🚀', '💡', '🎨', '🧠', '🌟', '🤖', '📚'];

const STTButton: React.FC<{ onResult: (text: string) => void; lang?: 'bn-BD' | 'en-US'; }> = ({ onResult, lang = 'bn-BD' }) => {
  const [isListening, setIsListening] = useState(false);
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("দুঃখিত, আপনার ব্রাউজার স্পিচ-টু-টেক্সট সমর্থন করে না।");
      return;
    }
    const recognition = new SpeechRecognition();
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
    <button onClick={startListening} title="ভয়েস ব্যবহার করুন" className={`p-3 rounded-2xl border transition-all shadow-sm ${isListening ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-indigo-600'}`}>
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
    <button onClick={handleCopy} title="কপি করুন" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 backdrop-blur-sm rounded-xl">
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: any; onClick: () => void; }> = ({ icon, title, desc, color, onClick }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100 border-green-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100",
    pink: "bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-100",
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100",
    cyan: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-100",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100",
  }[color as string] || "bg-slate-50";

  return (
    <button onClick={onClick} className={`${colorClasses} p-6 rounded-[32px] text-left transition-all hover:scale-[1.02] active:scale-[0.98] border shadow-sm flex flex-col gap-4 group`}>
      <div className="p-3 rounded-2xl bg-white shadow-sm w-fit group-hover:rotate-6 transition-transform">{icon}</div>
      <div><h3 className="text-xl font-black tracking-tight">{title}</h3><p className="text-sm font-medium opacity-80 mt-1">{desc}</p></div>
    </button>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const isInternalChange = useRef(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => JSON.parse(localStorage.getItem('studybuddy_users_db') || '[]'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const loggedInId = localStorage.getItem('studybuddy_active_user_id');
    if (loggedInId) {
      const user = JSON.parse(localStorage.getItem('studybuddy_users_db') || '[]').find((u: any) => u.id === loggedInId);
      if (user) return user;
    }
    return null;
  });
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => JSON.parse(localStorage.getItem('studybuddy_admin_profile') || JSON.stringify(DEFAULT_ADMIN)));
  const [adminPost, setAdminPost] = useState<AdminPost>(() => JSON.parse(localStorage.getItem('studybuddy_admin_post') || '{"text": "", "timestamp": 0}'));
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>(() => JSON.parse(localStorage.getItem('studybuddy_help') || '[]'));
  const [notices, setNotices] = useState<Notice[]>(() => JSON.parse(localStorage.getItem('studybuddy_global_notices_list') || '[]'));
  const [homeBanner, setHomeBanner] = useState<string | null>(localStorage.getItem('studybuddy_home_banner_data'));
  const [homeBannerSize, setHomeBannerSize] = useState<string>(localStorage.getItem('studybuddy_home_banner_size') || "728 x 90 px");
  const [studyLinks, setStudyLinks] = useState<StudyLink[]>(() => JSON.parse(localStorage.getItem('studybuddy_links') || '[]'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('studybuddy_is_admin') === 'true');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isInternalChange.current = true;
      setMode(event.state?.mode || AppMode.HOME);
      setTimeout(() => isInternalChange.current = false, 50);
    };
    window.history.replaceState({ mode: AppMode.HOME }, "");
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => { if (!isInternalChange.current) window.history.pushState({ mode }, ""); }, [mode]);

  useEffect(() => {
    localStorage.setItem('studybuddy_users_db', JSON.stringify(allUsers));
    if (currentUser) {
      const u = allUsers.find(x => x.id === currentUser.id);
      if (!u || u.isBlocked) {
        setCurrentUser(null);
        if(u?.isBlocked) alert("আপনার অ্যাকাউন্ট ব্লক করা হয়েছে!");
      } else {
        if (JSON.stringify(u) !== JSON.stringify(currentUser)) {
          setCurrentUser(u);
        }
      }
    }
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('studybuddy_active_user_id', currentUser.id);
    else localStorage.removeItem('studybuddy_active_user_id');
  }, [currentUser]);

  useEffect(() => localStorage.setItem('studybuddy_global_notices_list', JSON.stringify(notices)), [notices]);
  useEffect(() => localStorage.setItem('studybuddy_help', JSON.stringify(helpMessages)), [helpMessages]);
  useEffect(() => localStorage.setItem('studybuddy_is_admin', isAdmin.toString()), [isAdmin]);
  useEffect(() => localStorage.setItem('studybuddy_links', JSON.stringify(studyLinks)), [studyLinks]);
  useEffect(() => localStorage.setItem('studybuddy_admin_post', JSON.stringify(adminPost)), [adminPost]);
  useEffect(() => localStorage.setItem('studybuddy_admin_profile', JSON.stringify(adminProfile)), [adminProfile]);
  useEffect(() => {
    if (homeBanner) localStorage.setItem('studybuddy_home_banner_data', homeBanner);
    else localStorage.removeItem('studybuddy_home_banner_data');
    localStorage.setItem('studybuddy_home_banner_size', homeBannerSize);
  }, [homeBanner, homeBannerSize]);

  const changeMode = (m: AppMode) => setMode(m);
  const handleLogout = () => { setCurrentUser(null); setMode(AppMode.HOME); };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setAllUsers(prev => prev.map(u => u.id === updatedProfile.id ? updatedProfile : u));
    setCurrentUser(updatedProfile);
  };

  const handleDeleteAdminPost = () => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি ডিলিট করতে চান?")) {
      setAdminPost({ text: "", timestamp: 0, imageUrl: undefined });
      alert("পোস্ট সফলভাবে ডিলিট করা হয়েছে।");
    }
  };

  const userStats = useMemo(() => {
    if (!currentUser) return { level: "Beginner", progress: 0, nextThreshold: 100, rank: "শিক্ষানবিশ" };
    const p = currentUser.points;
    const level = p >= 1000 ? "লেজেন্ডারি (Legendary)" : p >= 500 ? "মাস্টারমাইন্ড (Mastermind)" : p >= 200 ? "অভিযাত্রী (Explorer)" : "শিক্ষানবিশ (Beginner)";
    const rank = p >= 1000 ? "গ্লোবাল টপার" : p >= 500 ? "সুপার স্কলার" : p >= 200 ? "অ্যাক্টিভ লার্নার" : "নতুন সদস্য";
    const next = p < 200 ? 200 : p < 500 ? 500 : p < 1000 ? 1000 : 5000;
    const prev = p < 200 ? 0 : p < 500 ? 200 : p < 1000 ? 500 : 1000;
    const progress = Math.min(((p - prev) / (next - prev)) * 100, 100);
    return { level, nextThreshold: next, progress, rank };
  }, [currentUser]);

  const todayStr = new Date().toLocaleDateString('en-US');
  const isRewardCompleted = currentUser?.lastChallengeDate === todayStr && currentUser?.dailyChallengeCount >= 5;

  const renderHome = () => {
    if (!currentUser) return <AuthView onLogin={setCurrentUser} users={allUsers} setAllUsers={setAllUsers} />;
    
    const bannerDimensions = homeBannerSize.split(' x ');
    const bannerWidth = parseInt(bannerDimensions[0]);
    const bannerHeight = parseInt(bannerDimensions[1]);
    const bannerAspectRatio = bannerWidth / bannerHeight;

    return (
      <div className="space-y-8 animate-in fade-in">
        {homeBanner && (
          <div className="w-full flex justify-center">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-50 relative group" style={{ width: '100%', maxWidth: `${bannerWidth}px`, aspectRatio: `${bannerAspectRatio}` }}>
              <img src={homeBanner} className="w-full h-full object-cover" alt="Home Banner" />
            </div>
          </div>
        )}
        
        {notices.map((n, i) => (
          <div key={n.id} className="bg-white border-2 border-slate-100 p-5 rounded-[28px] shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-yellow-400 text-white"><Megaphone size={18} /></div>
            <p className="text-slate-800 font-bold text-sm">{n.text}</p>
          </div>
        ))}

        {/* User Stats/Profile Bar */}
        <div onClick={() => changeMode(AppMode.PROFILE)} className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:scale-[1.01] transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-[36px] border-4 border-white shadow-xl bg-indigo-50 flex items-center justify-center text-5xl overflow-hidden">
              {currentUser.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" /> : AVATARS[currentUser.points % AVATARS.length]}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-black text-slate-800">{currentUser.name}</h2>
              <p className="text-sm font-bold text-slate-400 italic">{userStats.level}</p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex items-center gap-2 text-yellow-500 font-black text-3xl"><Trophy size={28} /> {currentUser.points}</div>
            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mt-2"><div className="h-full bg-indigo-600" style={{ width: `${userStats.progress}%` }}></div></div>
          </div>
        </div>

        {/* Admin Special Announcement Bar (Post Section) - Conditional Rendering */}
        {adminPost.text && adminPost.text.trim() !== "" && (
          <div className="bg-white p-6 rounded-[36px] shadow-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-5 transition-all hover:border-indigo-200 relative group">
             <div className="w-20 h-20 rounded-[30px] border-2 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                {adminPost.imageUrl ? (
                  <img src={adminPost.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="text-white" size={32} />
                )}
             </div>
             <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">অ্যাডমিন মেসেজ</div>
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed line-clamp-3">
                  {adminPost.text}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">স্টাডিবাডি টিম আপডেট</p>
             </div>
             <div className="hidden sm:block p-3 bg-slate-50 rounded-2xl border border-slate-100">
               <Quote size={20} className="text-indigo-200" />
             </div>
             
             {/* Admin Delete Action directly on Home */}
             {isAdmin && (
               <button 
                 onClick={(e) => { e.stopPropagation(); handleDeleteAdminPost(); }} 
                 className="absolute -top-2 -right-2 p-3 bg-rose-600 text-white rounded-full shadow-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20 border-2 border-white"
                 title="পোস্ট ডিলিট করুন"
               >
                 <Trash2 size={16} />
               </button>
             )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <MenuButton icon={<BookOpen size={28} />} title="সহজ পড়া মোড" color="blue" desc="টপিক গল্পের মতো বুঝে নাও" onClick={() => changeMode(AppMode.STUDY)} />
          <MenuButton icon={<Calculator size={28} />} title="অংক সমাধানকারী" color="purple" desc="অংকের উত্তর ও ব্যাখ্যা" onClick={() => changeMode(AppMode.MATH)} />
          <MenuButton icon={<Languages size={28} />} title="অনুবাদ ও উচ্চারণ" color="green" desc="ভাষা পরিবর্তন করে শেখা" onClick={() => changeMode(AppMode.SPEAKING)} />
          <MenuButton icon={<HelpCircle size={28} />} title="প্রশ্ন ও উত্তর" color="orange" desc="যেকোনো শিক্ষামূলক প্রশ্ন" onClick={() => changeMode(AppMode.QA)} />
          <MenuButton icon={<PenLine size={28} />} title="স্ক্রিপ্ট লিখে নাও" color="rose" desc="চমৎকার চিত্রনাট্য তৈরি করো" onClick={() => changeMode(AppMode.SCRIPT_WRITER)} />
          <MenuButton icon={<MessageCircle size={28} />} title="এআই বন্ধু চ্যাট" color="pink" desc="ইংরেজি প্র্যাকটিস করো" onClick={() => changeMode(AppMode.FRIEND_CHAT)} />
          <MenuButton icon={<MessageSquare size={28} />} title="হেল্প লাইন চ্যাট" color="indigo" desc="সরাসরি সাপোর্ট নাও" onClick={() => changeMode(AppMode.HELP_LINE)} />
          <MenuButton icon={<Type size={28} />} title="সঠিক বানান শিখুন" color="cyan" desc="ভুল বানান চেক করো" onClick={() => changeMode(AppMode.SPELLING)} />
        </div>

        {/* Daily Reward Section */}
        <div 
          onClick={() => changeMode(AppMode.DAILY_REWARD)} 
          className={`relative group overflow-hidden ${isRewardCompleted ? 'bg-green-600' : 'bg-gradient-to-br from-yellow-400 to-orange-500'} rounded-[48px] p-8 border-4 border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:scale-[1.02] transition-all`}
        >
          <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="p-5 bg-white rounded-3xl text-orange-500 shadow-xl group-hover:rotate-12 transition-transform">
              {isRewardCompleted ? <Award size={40} className="text-green-600" /> : <Gift size={40} />}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black text-white tracking-tight">ডেইলি রিওয়ার্ড পয়েন্ট</h3>
              <p className="text-white/90 font-bold text-sm mt-1">
                {isRewardCompleted 
                  ? "অভিনন্দন! আজকের লক্ষ্য পূরণ হয়েছে।" 
                  : "প্রতিদিন ৫টি সঠিক ইংরেজি বাক্য লিখে পয়েন্ট জিতে নিন!"}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center md:items-end gap-2">
            {!isRewardCompleted && (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full flex items-center gap-2">
                <span className="text-white font-black text-xs uppercase tracking-widest">বাকি আছে: {5 - (currentUser?.lastChallengeDate === todayStr ? currentUser.dailyChallengeCount : 0)}টি</span>
              </div>
            )}
            <div className="px-6 py-2 bg-white rounded-2xl text-orange-600 font-black text-sm shadow-lg flex items-center gap-2">
              {isRewardCompleted ? "আজকের চ্যালেঞ্জ শেষ" : "রিওয়ার্ড গ্রহণ করো"} <ArrowLeft size={16} className="rotate-180" />
            </div>
          </div>
        </div>

        {/* Study Links Section */}
        {studyLinks.length > 0 && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><LinkIcon className="text-indigo-600" size={20} /> গুরুত্বপূর্ণ লিংকসমূহ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyLinks.slice().reverse().map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><ExternalLink size={18} className="text-indigo-600" /></div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">{link.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{link.date}</p>
                    </div>
                  </div>
                  <ArrowLeft size={16} className="rotate-180 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Developer/Admin Banner */}
        <div className="relative group overflow-hidden bg-slate-900 rounded-[48px] p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-indigo-500/50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-2xl group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden border border-white/20">
              {adminProfile.photoUrl ? (
                <img src={adminProfile.photoUrl} className="w-full h-full object-cover" />
              ) : (
                <Terminal size={32} />
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">অ্যাডমিন ও ডেভেলপার</p>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">{adminProfile.name}</h3>
              <p className="text-slate-400 font-bold text-xs flex items-center justify-center md:justify-start gap-2 mt-1">
                <Mail size={12} className="text-indigo-400" /> {adminProfile.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/90 backdrop-blur-md shadow-md p-4 sticky top-0 z-50 border-b border-indigo-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div onClick={() => changeMode(AppMode.HOME)} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform"><BookOpen size={24} /></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">স্টাডিবাডি</h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">আপনার পড়াশোনার বন্ধু</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => changeMode(AppMode.ADMIN)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm transition-all"><ShieldCheck size={22} /></button>
            {currentUser && <button onClick={() => changeMode(AppMode.PROFILE)} className="w-12 h-12 rounded-2xl border-2 border-indigo-100 overflow-hidden hover:scale-105 transition-transform">{currentUser.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-xl">{AVATARS[currentUser.points % AVATARS.length]}</div>}</button>}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {(mode !== AppMode.HOME && mode !== AppMode.ADMIN) && <button onClick={() => window.history.back()} className="mb-6 flex items-center gap-2 text-slate-400 font-black hover:text-indigo-600"><ArrowLeft size={18} /> ফিরে যাও</button>}
        {mode === AppMode.HOME && renderHome()}
        {mode === AppMode.STUDY && <StudyView setLoading={setLoading} />}
        {mode === AppMode.MATH && <MathView setLoading={setLoading} />}
        {mode === AppMode.SPEAKING && <SpeakingView setLoading={setLoading} />}
        {mode === AppMode.QA && <QAView setLoading={setLoading} />}
        {mode === AppMode.SCRIPT_WRITER && <ScriptWriterView setLoading={setLoading} />}
        {mode === AppMode.FRIEND_CHAT && <FriendChatView setLoading={setLoading} />}
        {mode === AppMode.SPELLING && <SpellingView setLoading={setLoading} />}
        {mode === AppMode.DAILY_REWARD && <DailyRewardView currentUser={currentUser} onUpdate={handleUpdateProfile} setLoading={setLoading} />}
        {mode === AppMode.HELP_LINE && <HelpLineView helpMessages={helpMessages} setHelpMessages={setHelpMessages} userId={currentUser?.id} userName={currentUser?.name} isAdmin={isAdmin} adminName={adminProfile.name} />}
        {mode === AppMode.ADMIN && <AdminPanel isAdmin={isAdmin} setIsAdmin={setIsAdmin} setMode={setMode} helpMessages={helpMessages} setHelpMessages={setHelpMessages} adminProfile={adminProfile} setAdminProfile={setAdminProfile} adminPost={adminPost} setAdminPost={setAdminPost} notices={notices} setNotices={setNotices} studyLinks={studyLinks} setStudyLinks={setStudyLinks} homeBanner={homeBanner} setHomeBanner={setHomeBanner} homeBannerSize={homeBannerSize} setHomeBannerSize={setHomeBannerSize} allUsers={allUsers} setAllUsers={setAllUsers} />}
        {mode === AppMode.PROFILE && <ProfileView profile={currentUser} onLogout={handleLogout} onUpdate={handleUpdateProfile} stats={userStats} />}
      </main>
      {loading && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center"><div className="bg-white p-12 rounded-[48px] shadow-2xl flex flex-col items-center"><div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><p className="text-indigo-600 font-black text-2xl mt-8">একটু অপেক্ষা করো...</p></div></div>}
    </div>
  );
};

// Components
const AuthView = ({ onLogin, users, setAllUsers }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [un, setUn] = useState('');
  const [pw, setPw] = useState('');
  const [nm, setNm] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isLogin) {
      const u = users.find((x: any) => x.username === un && x.password === pw);
      if (u) {
        if(u.isBlocked) return alert("আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে!");
        onLogin(u);
      } else alert("ভুল ইউজারনেম বা পাসওয়ার্ড!");
    } else {
      if(users.some((x:any) => x.username === un)) return alert("এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত!");
      const u = { 
        id: Date.now().toString(), 
        username: un, 
        password: pw, 
        name: nm, 
        bio: 'স্টাডিবাডি অ্যাপে আমি একজন নতুন ছাত্র!', 
        points: 0, 
        streak: 0, 
        dailyChallengeCount: 0, 
        lastChallengeDate: '', 
        joinDate: new Date().toLocaleDateString('bn-BD'), 
        isBlocked: false,
        photoUrl: photoUrl || undefined
      };
      setAllUsers([...users, u]); onLogin(u);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[60vh] animate-in zoom-in">
      <div className="bg-white p-10 rounded-[48px] shadow-2xl w-full max-w-md space-y-8 text-center border">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600">{isLogin ? <LogIn size={40} /> : <UserPlus size={40} />}</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black">{isLogin ? 'StuddyBuddy তে লগইন করুন' : 'StuddyBuddy তে রেজিস্ট্রেশন করুন'}</h2>
          <p className="text-sm font-bold text-slate-400 italic">আপনার শেখার যাত্রাকে আরও সহজ ও আনন্দদায়ক করুন</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLogin && (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => (document.getElementById('auth-photo') as any).click()}>
                  {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <Camera size={32} className="text-indigo-300" />}
                </div>
                <p className="text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-widest">প্রোফাইল ছবি দিন</p>
                <input id="auth-photo" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" placeholder="নাম" value={nm} onChange={e => setNm(e.target.value)} required />
            </>
          )}
          <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" placeholder="ইউজার নেম" value={un} onChange={e => setUn(e.target.value)} required />
          <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" type="password" placeholder="পাসওয়ার্ড" value={pw} onChange={e => setPw(e.target.value)} required />
          <button className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-indigo-700 transition-colors">নিশ্চিত করুন</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-bold">{isLogin ? 'নতুন অ্যাকাউন্ট?' : 'লগইন করুন'}</button>
      </div>
    </div>
  );
};

const StudyView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [res, setRes] = useState<any>(null);
  const handle = async () => { if(!input.trim()) return; setLoading(true); try { setRes(await getStudyExplanation(input)); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-6 animate-in slide-up">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black">সহজ পড়া মোড</h2><STTButton onResult={setInput} /></div>
      <textarea className="w-full bg-slate-50 border-2 rounded-3xl p-6 min-h-[200px] font-bold outline-none border-slate-100" placeholder="টপিক..." value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handle} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl">শুরু করো</button>
      {res && <div className="p-8 bg-blue-50/50 rounded-[32px] border-2 border-blue-100 relative whitespace-pre-wrap"><div className="absolute top-4 right-4"><CopyButton text={res} /></div>{res}</div>}
    </div>
  );
};

const MathView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [img, setImg] = useState<string | null>(null);
  const [res, setRes] = useState<any>(null);
  const handle = async () => { if(!input.trim() && !img) return; setLoading(true); try { setRes(await solveMath(input, img?.split(',')[1])); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-6 animate-in slide-up overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Calculator size={24} /></div>
          <h2 className="text-2xl font-black">অংক সমাধানকারী</h2>
        </div>
        <div className="flex gap-2">
          <STTButton onResult={setInput} />
          <button onClick={() => (document.getElementById('m-img') as any).click()} className="p-3 bg-slate-50 rounded-2xl border text-slate-400 hover:text-purple-600 transition-colors shadow-sm"><Camera size={20} /></button>
          <input id="m-img" type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => setImg(r.result as string); r.readAsDataURL(f); } }} />
        </div>
      </div>
      
      {img && <div className="relative rounded-[32px] overflow-hidden border-4 border-slate-100 shadow-lg"><img src={img} className="w-full max-h-64 object-contain bg-slate-50" /><button onClick={() => setImg(null)} className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-rose-500 hover:bg-white shadow-sm transition-all"><X size={20}/></button></div>}
      
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-wider">অংকটি লিখুন অথবা ছবি দিন</label>
        <textarea className="w-full bg-slate-50 border-2 rounded-3xl p-6 min-h-[150px] font-bold outline-none border-slate-100 focus:border-purple-600 transition-all text-slate-700" placeholder="এখানে টাইপ করো..." value={input} onChange={e => setInput(e.target.value)} />
      </div>

      <button onClick={handle} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        সমাধান করো <Sparkles size={24} />
      </button>

      {res && (
        <div className="animate-in slide-up">
          <div className="p-8 bg-purple-50/50 rounded-[40px] border-2 border-purple-100 relative shadow-inner">
             <div className="absolute top-6 right-6 z-10">
               <CopyButton text={res} />
             </div>
             <div className="flex items-center gap-2 mb-6 text-purple-600">
               <div className="p-2 bg-purple-100 rounded-lg"><Sparkles size={18}/></div>
               <span className="font-black text-sm uppercase tracking-tighter">যাদুকরী সমাধান</span>
             </div>
             <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">
               {res}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpeakingView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [res, setRes] = useState<any>(null);
  const [dir, setDir] = useState<'bn-en' | 'en-bn'>('bn-en');
  const handle = async () => { if(!input.trim()) return; setLoading(true); try { const raw = await getTranslationAndGuide(input, dir); if(raw){ const t = raw.match(/TRANSLATION:\s*(.*)/); const p = raw.match(/PRONUNCIATION:\s*(.*)/); setRes({ t: t?.[1], p: p?.[1] }); } } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-6 animate-in slide-up">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black">অনুবাদ</h2><button onClick={() => setDir(dir === 'bn-en' ? 'en-bn' : 'bn-en')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs">{dir === 'bn-en' ? 'BN-EN' : 'EN-BN'}</button></div>
      <textarea className="w-full bg-slate-50 border-2 rounded-3xl p-6 font-bold outline-none border-slate-100" placeholder="টেক্সট..." value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handle} className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-xl">অনুবাদ করো</button>
      {res && <div className="p-8 bg-green-50/50 rounded-[32px] border-2 border-green-100 text-center space-y-2 font-bold relative"><div className="absolute top-4 right-4"><CopyButton text={res.t} /></div><p className="text-xl">{res.t}</p><p className="text-green-700">{res.p}</p></div>}
    </div>
  );
};

const QAView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [res, setRes] = useState<any>(null);
  const handle = async () => { if(!input.trim()) return; setLoading(true); try { setRes(await getQA(input)); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-6 animate-in slide-up">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black">প্রশ্ন ও উত্তর</h2><STTButton onResult={setInput} /></div>
      <textarea className="w-full bg-slate-50 border-2 rounded-3xl p-6 min-h-[150px] font-bold outline-none border-slate-100" placeholder="প্রশ্ন..." value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handle} className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xl">উত্তর খোঁজো</button>
      {res && <div className="p-8 bg-orange-50/50 rounded-[32px] border-2 border-orange-100 relative whitespace-pre-wrap"><div className="absolute top-4 right-4"><CopyButton text={res} /></div>{res}</div>}
    </div>
  );
};

const ScriptWriterView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [res, setRes] = useState<any>(null);
  const [cp, setCp] = useState('পুরো স্ক্রিপ্ট কপি করো');
  const handle = async () => { if(!input.trim()) return; setLoading(true); try { setRes(await getScriptContent(input, lang)); } finally { setLoading(false); } };
  const copy = () => { if(res){ navigator.clipboard.writeText(res); setCp('কপি হয়েছে!'); setTimeout(() => setCp('পুরো স্ক্রিপ্ট কপি করো'), 2000); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-6 animate-in slide-up">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black">স্ক্রিপ্ট লিখে নাও</h2><div className="flex gap-2"><button onClick={() => setLang('bn')} className={`px-4 py-2 rounded-xl text-xs font-black ${lang === 'bn' ? 'bg-rose-600 text-white' : 'bg-slate-50'}`}>বাংলা</button><button onClick={() => setLang('en')} className={`px-4 py-2 rounded-xl text-xs font-black ${lang === 'en' ? 'bg-rose-600 text-white' : 'bg-slate-50'}`}>ENG</button></div></div>
      <textarea className="w-full bg-slate-50 border-2 rounded-3xl p-6 min-h-[180px] font-bold outline-none border-slate-100" placeholder="টপিক..." value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handle} className="w-full bg-rose-600 text-white py-5 rounded-3xl font-black text-xl">স্ক্রিপ্ট তৈরি করো</button>
      {res && (
        <div className="p-8 bg-rose-50/50 rounded-[32px] border-2 border-rose-100 space-y-4 animate-in">
          <div className="whitespace-pre-wrap font-medium">{res}</div>
          <button onClick={copy} className="w-full py-4 bg-white border-2 border-rose-200 rounded-2xl text-rose-600 font-black flex items-center justify-center gap-2"><Copy size={18} /> {cp}</button>
        </div>
      )}
    </div>
  );
};

const DailyRewardView = ({ currentUser, onUpdate, setLoading }: any) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const todayStr = new Date().toLocaleDateString('en-US');
  
  const currentCount = currentUser.lastChallengeDate === todayStr ? currentUser.dailyChallengeCount : 0;
  
  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await checkDailyGoal(input);
      if (res.includes("SUCCESS")) {
        const newCount = currentCount + 1;
        const newPoints = newCount === 5 ? currentUser.points + 50 : currentUser.points;
        
        onUpdate({
          ...currentUser,
          points: newPoints,
          dailyChallengeCount: newCount,
          lastChallengeDate: todayStr
        });
        
        setInput('');
        setFeedback(newCount === 5 ? "অসাধারন! আজ আপনি ৫০ পয়েন্ট রিওয়ার্ড পেয়েছেন!" : "সঠিক হয়েছে! আরও এগিয়ে যান।");
        if (newCount === 5) {
          alert("অভিনন্দন! ৫টি বাক্য সঠিক হয়েছে। আপনি ৫০ পয়েন্ট রিওয়ার্ড পেয়েছেন।");
        }
      } else {
        setFeedback(res);
      }
    } finally {
      setLoading(false);
    }
  };

  if (currentCount >= 5) {
    return (
      <div className="bg-white p-12 rounded-[48px] shadow-sm border text-center space-y-6 animate-in zoom-in">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[36px] flex items-center justify-center mx-auto shadow-inner">
          <Award size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800">আজকের লক্ষ্য পূরণ!</h2>
          <p className="text-slate-500 font-bold">আপনি ৫টি সঠিক বাক্য লিখে ৫০ পয়েন্ট অর্জন করেছেন। আগামীকাল আবার চেষ্টা করুন!</p>
        </div>
        <button onClick={() => window.history.back()} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl shadow-xl">হোম পেজে ফিরে যান</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-8 animate-in slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-3xl"><Star size={28} /></div>
          <div>
            <h2 className="text-2xl font-black">ডেইলি রিওয়ার্ড পয়েন্ট</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">৫টি সঠিক বাক্যে ৫০ পয়েন্ট</p>
          </div>
        </div>
        <div className="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
           <span className="text-indigo-600 font-black text-lg">{currentCount}/5</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner">
         <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${(currentCount / 5) * 100}%` }}></div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">একটি ইংরেজি বাক্য লিখুন</label>
        <textarea 
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] p-6 min-h-[150px] font-bold outline-none focus:border-orange-500 transition-all text-slate-700" 
          placeholder="যেমন: I am a student of StudyBuddy app..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
        />
      </div>

      <button 
        onClick={handleCheck} 
        disabled={currentCount >= 5}
        className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
      >
        চেক এবং সাবমিট <Zap size={24} />
      </button>

      {feedback && (
        <div className={`p-6 rounded-[32px] border-2 font-bold ${feedback.includes('সঠিক') || feedback.includes('অসাধারন') ? 'bg-green-50 border-green-100 text-green-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
          <div className="flex items-start gap-3">
             <Info size={20} className="shrink-0 mt-1" />
             <p>{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FriendChatView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState<any[]>([]);
  const handle = async () => {
    if(!input.trim()) return;
    const nm = [...msg, { role: 'user', parts: [{ text: input }] }]; setMsg(nm); setInput(''); setLoading(true);
    try { const r = await chatWithAiFriend(msg, input); setMsg([...nm, { role: 'model', parts: [{ text: r }] }]); } finally { setLoading(false); }
  };
  return (
    <div className="bg-white p-6 rounded-[40px] shadow-sm border flex flex-col h-[600px] animate-in slide-up">
      <h2 className="text-2xl font-black mb-6">এআই বন্ধু চ্যাট</h2>
      <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
        {msg.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl font-bold shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-100'}`}>{m.parts[0].text}</div>
          </div>
        ))}
        {msg.length === 0 && <div className="text-center py-12 text-slate-400 italic">বন্ধুত্বপূর্ণ ইংরেজি শিখতে চ্যাট শুরু করো!</div>}
      </div>
      <div className="flex gap-2 mt-4"><input className="flex-1 bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" placeholder="Hi..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} /><button onClick={handle} className="p-4 bg-pink-600 text-white rounded-2xl shadow-lg"><Send size={20} /></button></div>
    </div>
  );
};

const HelpLineView = ({ helpMessages, setHelpMessages, userId, userName, isAdmin, adminName }: any) => {
  const [input, setInput] = useState('');
  const handle = () => { if(!input.trim()) return; setHelpMessages([...helpMessages, { id: Date.now().toString(), userId, userName: isAdmin ? adminName : userName, text: input, timestamp: Date.now(), isAdmin }]); setInput(''); };
  return (
    <div className="bg-white p-6 rounded-[40px] shadow-sm border flex flex-col h-[600px] animate-in slide-up">
      <h2 className="text-2xl font-black mb-6">হেল্প লাইন</h2>
      <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
        {helpMessages.filter((m: any) => isAdmin || m.userId === userId).map((m: any) => (
          <div key={m.id} className={`flex flex-col ${m.isAdmin === isAdmin ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-black text-slate-400 mb-1 px-2">{m.userName} {m.isAdmin && "(Admin)"}</span>
            <div className={`p-4 rounded-3xl font-bold ${m.isAdmin === isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4"><input className="flex-1 bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" placeholder="সমস্যা লিখুন..." value={input} onChange={e => setInput(e.target.value)} /><button onClick={handle} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Send size={20} /></button></div>
    </div>
  );
};

const SpellingView = ({ setLoading }: any) => {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [res, setRes] = useState<any>(null);
  const handle = async () => { if(!input.trim()) return; setLoading(true); try { setRes(await getSpellingCorrection(input, lang)); } finally { setLoading(false); } };
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border space-y-6 animate-in slide-up">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black">বানান শিখুন</h2><div className="flex gap-2"><button onClick={() => setLang('bn')} className={`px-4 py-2 rounded-xl text-xs font-black ${lang === 'bn' ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>বাংলা</button><button onClick={() => setLang('en')} className={`px-4 py-2 rounded-xl text-xs font-black ${lang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>ENG</button></div></div>
      <textarea className="w-full bg-slate-50 border-2 rounded-3xl p-6 min-h-[150px] font-bold outline-none border-slate-100 focus:border-indigo-600" placeholder="টেক্সট..." value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handle} className="w-full bg-cyan-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl">চেক করো</button>
      {res && <div className="p-8 bg-cyan-50/50 rounded-[32px] border-2 border-cyan-100 relative whitespace-pre-wrap"><div className="absolute top-4 right-4"><CopyButton text={res} /></div>{res}</div>}
    </div>
  );
};

const AdminPanel = ({ isAdmin, setIsAdmin, setMode, helpMessages, setHelpMessages, notices, setNotices, studyLinks, setStudyLinks, allUsers, setAllUsers, adminProfile, setAdminProfile, adminPost, setAdminPost, homeBanner, setHomeBanner, homeBannerSize, setHomeBannerSize }: any) => {
  const [adminIdInput, setAdminIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(isAdmin);
  const [noticeInput, setNoticeInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [postTextInput, setPostTextInput] = useState(adminPost.text || '');
  const [postImgInput, setPostImgInput] = useState<string | null>(adminPost.imageUrl || null);
  const [profNameInput, setProfNameInput] = useState(adminProfile.name);
  const [profEmailInput, setProfEmailInput] = useState(adminProfile.email);
  const [profPhotoInput, setProfPhotoInput] = useState<string | null>(adminProfile.photoUrl || null);
  
  const BANNER_SIZES = [
    "728 x 90 px", "300 x 250 px", "336 x 280 px", "160 x 600 px", "300 x 600 px", "320 x 50 px", "320 x 100 px"
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminIdInput.trim() === 'Rimon' && password === '13457@Roman') {
      setIsUnlocked(true);
      setIsAdmin(true);
      localStorage.setItem('studybuddy_is_admin', 'true');
    } else {
      alert("ভুল হয়েছে সঠিক ইউজার আইডি ও পাসওয়ার্ড প্রদান করুন");
    }
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostImgInput(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfPhotoInput(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleHomeBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setHomeBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePost = () => {
    setAdminPost({ text: postTextInput, imageUrl: postImgInput || undefined, timestamp: Date.now() });
    alert("পোস্ট সফলভাবে সম্পন্ন হয়েছে!");
  };

  const handleDeletePostInternal = () => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি ডিলিট করতে চান?")) {
      setAdminPost({ text: "", timestamp: 0, imageUrl: undefined });
      setPostTextInput("");
      setPostImgInput(null);
      alert("অ্যাডমিন পোস্ট সফলভাবে ডিলিট করা হয়েছে!");
    }
  };

  const handleUpdateProfile = () => {
    setAdminProfile({ name: profNameInput, email: profEmailInput, photoUrl: profPhotoInput || undefined });
    alert("অ্যাডমিন প্রোফাইল আপডেট হয়েছে!");
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    setStudyLinks([...studyLinks, { id: Date.now().toString(), title: linkTitle, url: linkUrl, date: new Date().toLocaleDateString('bn-BD') }]);
    setLinkTitle('');
    setLinkUrl('');
    alert("লিংক সফলভাবে পোস্ট হয়েছে!");
  };

  if (!isUnlocked) return (
    <div className="bg-white p-10 rounded-[48px] shadow-2xl max-w-md mx-auto text-center space-y-8 animate-in zoom-in border border-indigo-50">
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600"><Shield size={40} /></div>
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-slate-800">অ্যাডমিন ড্যাশবোর্ড</h2>
        <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-start gap-3 text-left">
           <AlertTriangle size={24} className="text-rose-500 shrink-0 mt-1" />
           <p className="text-xs font-black text-rose-600 leading-relaxed uppercase tracking-tighter">
             Admin Rimon Mahmud Roman ব্যতীত অন্য কেউ লগইন করতে পারবেন না।
           </p>
        </div>
      </div>
      <form onSubmit={handleLogin} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ইউজার আইডি</label>
          <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" placeholder="" value={adminIdInput} onChange={e => setAdminIdInput(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">পাসওয়ার্ড</label>
          <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold outline-none border-slate-100 focus:border-indigo-600" type="password" placeholder="" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">প্যানেল আনলক করুন</button>
      </form>
    </div>
  );

  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((u: any) => !u.isBlocked).length,
    totalPoints: allUsers.reduce((acc: number, u: any) => acc + u.points, 0),
    helpMsgs: helpMessages.length
  };

  return (
    <div className="space-y-8 animate-in slide-up">
      <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex justify-between items-center shadow-xl border-b-8 border-indigo-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20"><LayoutDashboard size={32} /></div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">অ্যাডমিন প্যানেল</h2>
            <p className="text-xs font-bold opacity-80 flex items-center gap-1"><Activity size={12}/> স্বাগতম, {adminProfile.name}</p>
          </div>
        </div>
        <button onClick={() => { setIsAdmin(false); setIsUnlocked(false); localStorage.removeItem('studybuddy_is_admin'); setMode(AppMode.HOME); }} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all active:scale-90" title="লগ আউট"><LogOut size={24}/></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'মোট ইউজার', value: stats.totalUsers, icon: <Users size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'সচল ইউজার', value: stats.activeUsers, icon: <Activity size={20}/>, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'মোট পয়েন্ট', value: stats.totalPoints, icon: <Trophy size={20}/>, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'হেল্প মেসেজ', value: stats.helpMsgs, icon: <MessageSquare size={20}/>, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl w-fit mb-3`}>{s.icon}</div>
            <p className="text-3xl font-black text-slate-800">{s.value}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Layout className="text-indigo-600" size={20} /> হোম পেজ ব্যানার ম্যানেজমেন্ট</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ব্যানার সাইজ সিলেক্ট করুন</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BANNER_SIZES.map(size => (
                  <button key={size} onClick={() => setHomeBannerSize(size)} className={`px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 ${homeBannerSize === size ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ব্যানার ইমেজ আপলোড</label>
             <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[32px] p-6 hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50 min-h-[200px]" onClick={() => document.getElementById('home-banner-upload')?.click()}>
                {homeBanner ? (
                  <div className="w-full h-full flex flex-col items-center">
                    <img src={homeBanner} className="max-w-full max-h-40 rounded-xl object-contain shadow-md mb-4" />
                    <p className="text-xs font-black text-indigo-600">ছবি পরিবর্তন করুন</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon size={48} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500">ব্যানার আপলোড করুন</p>
                  </div>
                )}
                <input id="home-banner-upload" type="file" className="hidden" accept="image/*" onChange={handleHomeBannerUpload} />
             </div>
             {homeBanner && <button onClick={() => setHomeBanner(null)} className="w-full py-3 bg-rose-50 text-rose-600 font-black text-xs rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all">ব্যানার ডিলিট করুন</button>}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><LinkIcon className="text-indigo-600" size={20} /> লিংক ম্যানেজমেন্ট</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 outline-none font-bold focus:border-indigo-600" placeholder="লিংকের শিরোনাম" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
            <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 outline-none font-bold focus:border-indigo-600" placeholder="ইউআরএল (https://...)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
          </div>
          <button onClick={handleAddLink} className="w-full bg-indigo-600 text-white py-4 rounded-[28px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <PlusCircle size={20}/> নতুন লিংক যুক্ত করুন
          </button>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {studyLinks.map((l) => (
            <div key={l.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex-1 truncate mr-4">
                <p className="text-sm font-black text-slate-800 truncate">{l.title}</p>
                <p className="text-[10px] text-indigo-600 font-bold truncate">{l.url}</p>
              </div>
              <button onClick={() => setStudyLinks(studyLinks.filter(x => x.id !== l.id))} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={18}/></button>
            </div>
          ))}
          {studyLinks.length === 0 && <p className="text-center py-8 text-slate-300 font-bold">কোনো লিংক নেই</p>}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><User className="text-indigo-600" size={20} /> অ্যাডমিন প্রোফাইল এডিট</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">অ্যাডমিন নাম</label>
              <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 outline-none font-bold focus:border-indigo-600" value={profNameInput} onChange={e => setProfNameInput(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">অ্যাডমিন ইমেইল</label>
              <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 outline-none font-bold focus:border-indigo-600" value={profEmailInput} onChange={e => setProfEmailInput(e.target.value)} />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ব্যানার লোগো / ছবি</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[32px] p-6 hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50" onClick={() => document.getElementById('prof-photo-img')?.click()}>
              {profPhotoInput ? <img src={profPhotoInput} className="w-24 h-24 rounded-2xl object-cover shadow-md" /> : <ImageIcon size={32} className="text-slate-300 mb-2" />}
              <p className="text-xs font-bold text-slate-500 mt-2">ছবি পরিবর্তন করুন</p>
              <input type="file" id="prof-photo-img" className="hidden" accept="image/*" onChange={handleProfPhotoChange} />
            </div>
          </div>
        </div>
        <button onClick={handleUpdateProfile} className="w-full bg-indigo-600 text-white py-4 rounded-[28px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Save size={20}/> প্রোফাইল সেভ করুন
        </button>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Sparkles className="text-indigo-600" size={20} /> হোম পেজ অ্যাডমিন পোস্ট</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">পোস্টের লেখা</label>
            <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 font-bold outline-none focus:border-indigo-600 min-h-[120px]" value={postTextInput} onChange={e => setPostTextInput(e.target.value)} placeholder="হোম পেজের বার-এ কী লেখা থাকবে?" />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">পোস্টের ছবি</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[32px] p-6 hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50" onClick={() => document.getElementById('admin-post-img')?.click()}>
              {postImgInput ? <img src={postImgInput} className="w-24 h-24 rounded-2xl object-cover shadow-md" /> : <ImageIcon size={32} className="text-slate-300 mb-2" />}
              <p className="text-xs font-bold text-slate-500 mt-2">ছবি পরিবর্তন করুন</p>
              <input type="file" id="admin-post-img" className="hidden" accept="image/*" onChange={handlePostImageChange} />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleUpdatePost} className="flex-1 bg-indigo-600 text-white py-4 rounded-[28px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Save size={20}/> আপডেট নিশ্চিত করুন
          </button>
          <button onClick={handleDeletePostInternal} className="bg-rose-50 text-rose-600 py-4 px-8 rounded-[28px] font-black text-lg border border-rose-100 hover:bg-rose-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Trash2 size={20}/> ডিলিট করুন
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Users className="text-indigo-600" size={20} /> ইউজার তালিকা (পাসওয়ার্ড দৃশ্যমান)</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 rounded-tl-2xl">প্রোফাইল</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400">পাসওয়ার্ড</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400">পয়েন্ট</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 rounded-tr-2xl text-center">ব্লক/সচল</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u: any, i: number) => (
                <tr key={u.id} className={`${i !== allUsers.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner overflow-hidden">
                        {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : AVATARS[u.points % AVATARS.length]}
                      </div>
                      <div><p className="font-black text-sm text-slate-800">{u.name}</p><p className="text-[10px] font-bold text-slate-400">@{u.username}</p></div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-600 font-black border border-indigo-100">{u.password}</span>
                      <button onClick={() => { navigator.clipboard.writeText(u.password || ''); alert('Password copied!'); }} className="text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={14}/></button>
                    </div>
                  </td>
                  <td className="py-5 px-4"><div className="flex items-center gap-1 font-black text-indigo-600 text-sm"><Zap size={14} className="fill-current"/> {u.points}</div></td>
                  <td className="py-5 px-4 text-center">
                    <button onClick={() => setAllUsers(allUsers.map((x: any) => x.id === u.id ? { ...x, isBlocked: !x.isBlocked } : x))} className={`p-3 rounded-2xl transition-all shadow-sm ${u.isBlocked ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-white'}`} title={u.isBlocked ? "Unblock User" : "Block User"}>
                      {u.isBlocked ? <ShieldAlert size={20} /> : <ShieldOff size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
              {allUsers.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-300 font-bold italic">এখনও কোনো ইউজার নেই</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Megaphone size={22} className="text-indigo-600" /> নোটিশ বোর্ড</h3>
          <div className="flex gap-2">
            <input className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 outline-none font-bold focus:border-indigo-600" placeholder="নতুন নোটিশ লিখুন..." value={noticeInput} onChange={e => setNoticeInput(e.target.value)} />
            <button onClick={() => { if(noticeInput.trim()){ setNotices([...notices, { id: Date.now().toString(), text: noticeInput, timestamp: Date.now() }]); setNoticeInput(''); alert("নোটিশ সফলভাবে পোস্ট হয়েছে!"); } }} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md hover:bg-indigo-700 transition-colors active:scale-95"><PlusCircle size={22} /></button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {notices.slice().reverse().map((n: any) => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-indigo-100 transition-colors">
                <div className="flex-1"><p className="text-sm font-bold text-slate-700">{n.text}</p><p className="text-[9px] text-slate-400 font-black mt-1 uppercase">{new Date(n.timestamp || parseInt(n.id)).toLocaleDateString()}</p></div>
                <button onClick={() => setNotices(notices.filter((x: any) => x.id !== n.id))} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={18}/></button>
              </div>
            ))}
            {notices.length === 0 && <p className="text-center py-8 text-slate-300 font-bold">কোনো নোটিশ নেই</p>}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><MessageSquare size={22} className="text-indigo-600" /> হেল্প লাইন ইনবক্স</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {helpMessages.slice().reverse().map((m: any) => (
              <div key={m.id} className={`p-4 rounded-[24px] border transition-all ${m.isAdmin ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 hover:bg-white shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${m.isAdmin ? 'bg-indigo-500' : 'bg-green-500'}`}></div><span className="text-[10px] font-black uppercase text-slate-400">{m.userName} {m.isAdmin && " (অ্যাডমিন)"}</span></div>
                  <button onClick={() => setHelpMessages(helpMessages.filter((x:any) => x.id !== m.id))} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={14}/></button>
                </div>
                <p className="text-sm font-bold text-slate-700 leading-snug">{m.text}</p>
              </div>
            ))}
            {helpMessages.length === 0 && <p className="text-center py-12 text-slate-300 font-bold italic">ইনবক্স খালি!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ profile, onLogout, onUpdate, stats }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || '');
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [editedPhoto, setEditedPhoto] = useState(profile?.photoUrl || '');

  const badges = [
    { name: 'নতুন লার্নার', icon: <Medal size={16}/>, minPoints: 0, color: 'text-slate-500 bg-slate-100' },
    { name: 'উদ্যমী ছাত্র', icon: <Medal size={16}/>, minPoints: 100, color: 'text-blue-500 bg-blue-100' },
    { name: 'অংক বিশারদ', icon: <Calculator size={16}/>, minPoints: 300, color: 'text-purple-500 bg-purple-100' },
    { name: 'ভাষাবিদ', icon: <Languages size={16}/>, minPoints: 600, color: 'text-green-500 bg-green-100' },
    { name: 'স্টাডি কিং', icon: <Trophy size={16}/>, minPoints: 1000, color: 'text-yellow-600 bg-yellow-100' },
  ];

  const earnedBadges = badges.filter(b => profile.points >= b.minPoints);

  const handleSave = () => {
    onUpdate({ ...profile, name: editedName, bio: editedBio, photoUrl: editedPhoto });
    setIsEditing(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditedPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-up">
      <div className="bg-white rounded-[48px] shadow-sm border border-indigo-50 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
          <button onClick={() => setIsEditing(!isEditing)} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all border border-white/20 shadow-lg z-10" title={isEditing ? "বাতিল করুন" : "প্রোফাইল এডিট করুন"}>
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
          </button>
        </div>
        <div className="px-10 pb-10 -mt-20 relative">
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-[48px] border-8 border-white shadow-2xl bg-white flex items-center justify-center text-7xl overflow-hidden shadow-indigo-100/50">
                {isEditing ? (editedPhoto ? <img src={editedPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-6xl">{AVATARS[profile?.points % AVATARS.length]}</div>) : (profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-6xl">{AVATARS[profile?.points % AVATARS.length]}</div>)}
              </div>
              {isEditing && <button onClick={() => (document.getElementById('profile-upload-input') as any).click()} className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all border-4 border-white active:scale-90"><Camera size={20} /><input id="profile-upload-input" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} /></button>}
            </div>
            <div className="flex-1 text-center sm:text-left pt-20 sm:pt-24 space-y-4">
              <div className="space-y-1">
                {isEditing ? <input className="text-3xl font-black text-slate-800 bg-slate-50 border-2 border-indigo-100 rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-600" value={editedName} onChange={e => setEditedName(e.target.value)} placeholder="আপনার নাম" /> : <h2 className="text-4xl font-black text-slate-800 leading-tight">{profile?.name}</h2>}
                <div className="flex items-center justify-center sm:justify-start gap-2"><span className="text-slate-400 font-bold">@{profile?.username}</span><span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span><span className="text-indigo-600 font-black text-xs uppercase tracking-widest">{stats.rank}</span></div>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3"><div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100 text-xs font-black uppercase"><Trophy size={14}/> {stats.level}</div><div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-xs font-black uppercase"><Calendar size={14}/> সদস্য যেহেতু: {profile.joinDate}</div></div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4"><h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Info size={16}/> আমার সম্পর্কে</h3>{isEditing ? <textarea className="w-full bg-slate-50 border-2 border-indigo-100 rounded-3xl p-6 font-bold text-slate-600 outline-none focus:border-indigo-600 min-h-[120px]" value={editedBio} onChange={e => setEditedBio(e.target.value)} placeholder="আপনার সম্পর্কে কিছু লিখুন..." /> : <p className="text-slate-600 font-medium leading-relaxed text-lg bg-slate-50 p-6 rounded-[32px] border border-slate-100">{profile?.bio || "এই ব্যবহারকারী এখনও কোনো বায়ো সেট করেননি।"}</p>}</div>
              <div className="space-y-4"><h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Award size={16}/> অর্জনসমূহ (Badges)</h3><div className="flex flex-wrap gap-4">{earnedBadges.map((b, i) => <div key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-black text-sm shadow-sm hover:scale-105 transition-transform ${b.color} border-current/10`}>{b.icon} {b.name}</div>)}{earnedBadges.length === 0 && <p className="text-slate-300 font-bold italic">এখনও কোনো ব্যাজ অর্জন হয়নি!</p>}</div></div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 space-y-8">
                <div className="space-y-6"><h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Activity size={16}/> পারফরম্যান্স</h3><div className="space-y-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Zap size={20}/></div><div><p className="text-2xl font-black text-slate-800">{profile.points}</p><p className="text-[10px] font-black text-slate-400 uppercase">মোট পয়েন্ট</p></div></div></div><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100"><TrendingUp size={20}/></div><div><p className="text-2xl font-black text-slate-800">{profile.streak}</p><p className="text-[10px] font-black text-slate-400 uppercase">দিনের স্ট্রাইক</p></div></div></div></div></div>
                <div className="space-y-4 pt-6 border-t border-slate-200"><div className="flex justify-between items-end"><p className="text-xs font-black text-slate-400 uppercase">নেক্সট লেভেল প্রগ্রেস</p><p className="text-xs font-black text-indigo-600">{Math.round(stats.progress)}%</p></div><div className="h-4 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner p-1"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div></div><p className="text-[10px] text-center text-slate-400 font-black">আারও {stats.nextThreshold - profile.points} পয়েন্ট প্রয়োজন</p></div>
              </div>
              {isEditing ? <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-5 rounded-[32px] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"><Save size={24}/> তথ্য সেভ করো</button> : <button onClick={onLogout} className="w-full bg-rose-50 text-rose-600 py-5 rounded-[32px] font-black flex items-center justify-center gap-3 border border-rose-100 hover:bg-rose-100 transition-all active:scale-[0.98]"><LogOut size={24}/> লগ আউট</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
