
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, User as UserIcon, Plus, ChevronLeft, LayoutDashboard, Settings, Trash2, UserPlus, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { INITIAL_USERS, CATEGORY_LABELS, CATEGORY_COLORS } from './constants';
import { User, Rating, RatingCategory } from './types';

// Helper to get a consistent color based on name
const getNameColor = (name: string) => {
  const colors = [
    'bg-pink-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400', 
    'bg-purple-400', 'bg-orange-400', 'bg-rose-400', 'bg-indigo-400'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const LetterAvatar = ({ name, size = 'md' }: { name: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const colorClass = getNameColor(name);
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl'
  };
  
  return (
    <div className={`${colorClass} ${sizeClasses[size]} rounded-full border-2 border-black flex items-center justify-center font-black text-black cartoon-shadow`}>
      {name.charAt(0)}
    </div>
  );
};

const Navbar = ({ onNavigate, currentPage }: { onNavigate: (page: string) => void, currentPage: string }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black p-4 z-50 flex justify-around items-center">
    <button onClick={() => onNavigate('dashboard')} className={`flex flex-col items-center ${currentPage === 'dashboard' ? 'text-blue-500' : 'text-black'}`}>
      <LayoutDashboard size={24} />
      <span className="text-[10px] font-bold mt-1">الرئيسية</span>
    </button>
    <button onClick={() => onNavigate('leaderboard')} className={`flex flex-col items-center ${currentPage === 'leaderboard' ? 'text-blue-500' : 'text-black'}`}>
      <Trophy size={24} />
      <span className="text-[10px] font-bold mt-1">المتصدرون</span>
    </button>
    <button onClick={() => onNavigate('profile-me')} className={`flex flex-col items-center ${currentPage === 'profile-me' ? 'text-blue-500' : 'text-black'}`}>
      <UserIcon size={24} />
      <span className="text-[10px] font-bold mt-1">ملفي</span>
    </button>
  </nav>
);

const UserCard = ({ user, onClick }: { user: User, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-white cartoon-border cartoon-shadow p-4 rounded-3xl cursor-pointer hover:translate-y-[-4px] transition-transform active:translate-y-[2px]"
  >
    <div className="flex items-center gap-4">
      <LetterAvatar name={user.name} />
      <div className="flex-1">
        <h3 className="font-black text-xl">{user.name}</h3>
        <p className="text-gray-500 text-sm">{user.handle}</p>
      </div>
      <div className="bg-yellow-300 cartoon-border px-3 py-1 rounded-full font-black">
        {user.points} ⚡
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sadeeqi_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [activeRatingTarget, setActiveRatingTarget] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  useEffect(() => {
    const savedRatings = localStorage.getItem('sadeeqi_ratings');
    if (savedRatings) setRatings(JSON.parse(savedRatings));
  }, []);

  useEffect(() => {
    localStorage.setItem('sadeeqi_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('sadeeqi_users', JSON.stringify(users));
  }, [users]);

  // Use "عبدو" as the session user
  const sessionUser = users.find(u => u.name === 'عبدو') || users[0] || { id: '0', name: 'زائر', handle: '@guest', points: 0, avatar: '' };

  const handleRate = (target: User) => {
    setActiveRatingTarget(target);
    setIsRatingModalOpen(true);
  };

  const submitRating = (category: RatingCategory, content: string, isSecret: boolean) => {
    if (!activeRatingTarget) return;

    const newRating: Rating = {
      id: Math.random().toString(36).substr(2, 9),
      fromUserId: sessionUser.id,
      toUserId: activeRatingTarget.id,
      category,
      content,
      isSecret,
      votes: 0,
      createdAt: Date.now(),
    };

    setRatings(prev => [...prev, newRating]);
    setUsers(prev => prev.map(u => 
      u.id === sessionUser.id ? { ...u, points: u.points + (isSecret ? 10 : 20) } : u
    ));

    setIsRatingModalOpen(false);
    setActiveRatingTarget(null);
  };

  const deleteRating = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      setRatings(prev => prev.filter(r => r.id !== id));
    }
  };

  const deleteUser = (id: string) => {
    if (window.confirm('حذف المستخدم سيؤدي لحذف كافة تقييماته ونقاطه. استمرار؟')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setRatings(prev => prev.filter(r => r.fromUserId !== id && r.toUserId !== id));
    }
  };

  const addNewUser = (name: string, handle: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      points: 0,
      avatar: ''
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleAdminLogin = () => {
    const normalizedInput = adminPasswordInput.trim();
    
    if (normalizedInput === 'عبدو عمك') {
      setIsAdminAuthenticated(true);
      setAdminPasswordInput('');
    } else {
      alert('كلمة السر خاطئة! 🚫');
      setAdminPasswordInput('');
    }
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black">أهلاً {sessionUser.name}! 👋</h1>
          <p className="text-gray-600">من تريد تقييمه اليوم؟</p>
        </div>
        <button 
          onClick={() => setCurrentPage('admin')}
          className="bg-white p-3 cartoon-border rounded-2xl cartoon-shadow hover:scale-110 active:scale-90 transition-transform text-red-500"
        >
          <Settings size={24} />
        </button>
      </header>

      <section className="bg-white cartoon-border cartoon-shadow p-4 rounded-3xl relative overflow-hidden">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> المتصدرون
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {users.length > 0 ? users.sort((a,b) => b.points - a.points).slice(0, 5).map(u => (
            <div key={u.id} className="flex flex-col items-center min-w-[80px]">
              <div className="relative">
                <LetterAvatar name={u.name} size="md" />
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[10px] px-1 font-bold cartoon-border rounded">
                  {u.points}
                </div>
              </div>
              <span className="text-sm font-bold mt-2 truncate w-20 text-center">{u.name}</span>
            </div>
          )) : <p className="text-xs font-bold text-gray-400">لا يوجد متصدرون بعد</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black">قائمة الأصدقاء</h2>
        {users.length > 0 ? users.map(u => (
          <UserCard 
            key={u.id} 
            user={u} 
            onClick={() => { setSelectedUserId(u.id); setCurrentPage('profile'); }} 
          />
        )) : <div className="text-center p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-400 font-bold">لم يتم إضافة أصدقاء بعد.</div>}
      </section>
    </div>
  );

  const renderProfile = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return <div className="p-6">المستخدم غير موجود</div>;

    const userRatings = ratings.filter(r => r.toUserId === userId);

    return (
      <div className="p-6 pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('dashboard')} className="p-2 bg-white cartoon-border rounded-xl">
              <ChevronLeft />
            </button>
            <h1 className="text-2xl font-black truncate max-w-[150px]">ملف {user.name}</h1>
          </div>
          <button 
            onClick={() => setCurrentPage('admin')}
            className="p-2 bg-white cartoon-border rounded-xl text-red-500"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="bg-white cartoon-border cartoon-shadow p-6 rounded-3xl text-center">
          <div className="flex justify-center mb-4">
            <LetterAvatar name={user.name} size="xl" />
          </div>
          <h2 className="text-3xl font-black">{user.name}</h2>
          <p className="text-gray-500">{user.handle}</p>
          <div className="flex justify-center gap-4 mt-6">
            <div className="bg-green-100 p-4 rounded-2xl cartoon-border flex-1">
              <span className="block font-black text-2xl">{userRatings.filter(r => r.category === 'PRO').length}</span>
              <span className="text-xs font-bold text-green-700">مميزات</span>
            </div>
            <div className="bg-red-100 p-4 rounded-2xl cartoon-border flex-1">
              <span className="block font-black text-2xl">{userRatings.filter(r => r.category === 'CON').length}</span>
              <span className="text-xs font-bold text-red-700">عيوب</span>
            </div>
          </div>
          <button 
            onClick={() => handleRate(user)}
            className="w-full mt-6 bg-yellow-400 cartoon-border cartoon-shadow py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Plus /> قيم {user.name} الآن!
          </button>
        </div>

        <section className="space-y-4">
          <h3 className="text-xl font-black">أحدث التقييمات</h3>
          {userRatings.length === 0 ? (
            <div className="text-center p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-400">لا يوجد تقييمات حتى الآن.</div>
          ) : (
            userRatings.sort((a,b) => b.createdAt - a.createdAt).map(rating => (
              <div key={rating.id} className="bg-white cartoon-border cartoon-shadow p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 border-black ${CATEGORY_COLORS[rating.category]}`}>{CATEGORY_LABELS[rating.category]}</span>
                </div>
                <p className="text-lg font-bold">"{rating.content}"</p>
                <div className="mt-3 text-xs text-gray-500 font-bold flex justify-between items-center">
                   <span>بواسطة: {rating.isSecret ? 'صديق مجهول 🕵️' : (users.find(u => u.id === rating.fromUserId)?.name)}</span>
                   {isAdminAuthenticated && (
                     <button onClick={() => deleteRating(rating.id)} className="text-red-500"><Trash2 size={16} /></button>
                   )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="p-6 pb-24 space-y-6">
      <h1 className="text-3xl font-black flex items-center gap-3">
        <Trophy className="text-yellow-500" /> لوحة الشرف
      </h1>
      <div className="bg-white cartoon-border cartoon-shadow rounded-3xl overflow-hidden">
        {users.length > 0 ? users.sort((a,b) => b.points - a.points).map((u, idx) => (
          <div key={u.id} className={`flex items-center p-6 gap-4 border-b-2 border-black last:border-0 ${idx === 0 ? 'bg-yellow-100' : ''}`}>
            <div className="w-8 font-black text-2xl italic">#{idx + 1}</div>
            <LetterAvatar name={u.name} size="md" />
            <div className="flex-1">
              <h3 className="font-black text-xl">{u.name}</h3>
              <p className="text-sm font-bold opacity-50">{u.points} نقطة</p>
            </div>
            {idx === 0 && <div className="text-4xl animate-bounce">👑</div>}
          </div>
        )) : <div className="p-10 text-center font-bold">لا يوجد بيانات</div>}
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdminAuthenticated) {
      return (
        <div className="p-6 pb-24 flex flex-col items-center justify-center min-h-[70vh] space-y-6">
          <div className="w-full flex justify-start">
            <button onClick={() => setCurrentPage('dashboard')} className="p-2 bg-white cartoon-border rounded-xl">
              <ChevronLeft />
            </button>
          </div>
          <div className="bg-red-100 p-6 rounded-full cartoon-border cartoon-shadow">
            <Lock size={64} className="text-red-600" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black">منطقة محظورة</h1>
            <p className="font-bold text-gray-500">أدخل كلمة السر للمتابعة</p>
          </div>
          <div className="w-full space-y-3">
            <input 
              type="text" 
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="كلمة السر..." 
              className="w-full cartoon-border p-4 rounded-2xl text-center text-2xl font-black" 
            />
            <button 
              onClick={handleAdminLogin}
              className="w-full bg-red-600 text-white cartoon-border cartoon-shadow py-4 rounded-2xl font-black text-xl active:translate-y-1 transition-transform"
            >
              فتح اللوحة 🔓
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 pb-24 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('dashboard')} className="p-2 bg-white cartoon-border rounded-xl">
              <ChevronLeft />
            </button>
            <h1 className="text-2xl font-black text-red-600">لوحة التحكم</h1>
          </div>
          <button 
            onClick={() => setIsAdminAuthenticated(false)}
            className="p-2 bg-white cartoon-border rounded-xl text-red-600 active:scale-90"
            title="خروج من الإدارة"
          >
            <Unlock size={24} />
          </button>
        </div>

        <section className="bg-white cartoon-border cartoon-shadow p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-black flex items-center gap-2">
            <UserPlus className="text-blue-500" /> إضافة صديق جديد
          </h2>
          <div className="space-y-3">
            <input id="new-name" type="text" placeholder="اسم الصديق" className="w-full cartoon-border p-3 rounded-xl font-bold" />
            <input id="new-handle" type="text" placeholder="المعرف (مثال: @username)" className="w-full cartoon-border p-3 rounded-xl font-bold" />
            <button 
              onClick={() => {
                const n = document.getElementById('new-name') as HTMLInputElement;
                const h = document.getElementById('new-handle') as HTMLInputElement;
                if (n.value && h.value) {
                  addNewUser(n.value, h.value);
                  n.value = '';
                  h.value = '';
                }
              }}
              className="w-full bg-blue-500 text-white cartoon-border cartoon-shadow py-3 rounded-xl font-black"
            >
              إضافة الصديق 🚀
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black">إدارة الأصدقاء ({users.length})</h2>
          <div className="grid gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-white cartoon-border cartoon-shadow p-4 rounded-2xl flex items-center gap-4">
                <LetterAvatar name={u.name} size="sm" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-black truncate">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.points} ⚡</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedUserId(u.id); setCurrentPage('profile'); }} className="p-2 bg-gray-100 cartoon-border rounded-lg"><UserIcon size={16} /></button>
                  <button onClick={() => deleteUser(u.id)} className="p-2 bg-red-100 text-red-600 cartoon-border rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black">إدارة التقييمات ({ratings.length})</h2>
          <div className="space-y-3">
            {ratings.length > 0 ? ratings.sort((a,b) => b.createdAt - a.createdAt).slice(0, 10).map(r => (
              <div key={r.id} className="bg-white cartoon-border p-3 rounded-xl flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border border-black ${CATEGORY_COLORS[r.category]}`}></div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">"{r.content}"</p>
                  <p className="text-[10px] text-gray-400">إلى: {users.find(u => u.id === r.toUserId)?.name || 'محذوف'}</p>
                </div>
                <button onClick={() => deleteRating(r.id)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
            )) : <p className="text-center text-gray-400 font-bold py-4">لا توجد تقييمات لإدارتها</p>}
            {ratings.length > 10 && <p className="text-center text-[10px] font-bold text-gray-400">يظهر أحدث 10 تقييمات فقط</p>}
          </div>
        </section>
        
        <button 
          onClick={() => {
            if (window.confirm('سيتم حذف كل البيانات المخصصة والعودة للإعدادات الأولية. هل أنت متأكد؟')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full bg-red-600 text-white cartoon-border py-4 rounded-2xl font-black text-sm"
        >
          فرمتة التطبيق بالكامل (Reset) 🧨
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative bg-[#fefce8] pb-10">
      {currentPage === 'dashboard' && renderDashboard()}
      {currentPage === 'profile' && selectedUserId && renderProfile(selectedUserId)}
      {currentPage === 'leaderboard' && renderLeaderboard()}
      {currentPage === 'profile-me' && renderProfile(sessionUser.id)}
      {currentPage === 'admin' && renderAdmin()}

      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      {isRatingModalOpen && activeRatingTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-sm cartoon-border cartoon-shadow rounded-t-3xl sm:rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-4">تقييم {activeRatingTarget.name}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['PRO', 'CON', 'WISH'] as RatingCategory[]).map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveRatingTarget(prev => prev ? { ...prev, selectedCategory: cat } as any : null)} 
                    className={`p-2 rounded-xl border-2 border-black text-[10px] font-black ${activeRatingTarget && (activeRatingTarget as any).selectedCategory === cat ? CATEGORY_COLORS[cat] : 'bg-gray-100'}`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <textarea 
                id="rating-text" 
                className="w-full cartoon-border rounded-2xl p-4 text-lg font-bold min-h-[120px]" 
                placeholder="اكتب ملاحظتك..."
              ></textarea>
              <div className="flex items-center gap-2 font-bold">
                <input type="checkbox" id="is-secret" className="w-6 h-6 border-2 border-black" />
                <label htmlFor="is-secret">تقييم سري؟ 🕵️</label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsRatingModalOpen(false)} className="flex-1 bg-gray-200 py-3 rounded-2xl font-black cartoon-border">إلغاء</button>
                <button 
                  onClick={() => {
                    const text = (document.getElementById('rating-text') as HTMLTextAreaElement).value;
                    const secret = (document.getElementById('is-secret') as HTMLInputElement).checked;
                    const cat = (activeRatingTarget as any).selectedCategory || 'PRO';
                    if (text.trim()) submitRating(cat, text, secret);
                  }} 
                  className="flex-[2] bg-blue-500 text-white py-3 rounded-2xl font-black cartoon-border"
                >
                  إرسال 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
