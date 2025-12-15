import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Send, Menu, MessageSquare, Plus, X, 
  History, Settings, Globe, Sparkles,
  ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal,
  LogIn, LogOut, Save, User
} from 'lucide-react';
import './index.css';

// ✨ [ZASK] 로고 컴포넌트
const ZaskLogo = ({ size = 40, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <rect x="5" y="5" width="90" height="90" rx="22" fill="currentColor" className="text-indigo-600" />
    <path 
      d="M30 32 H70 L30 68 H70" 
      stroke="white" 
      strokeWidth="11" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="70" cy="32" r="5" fill="#a5b4fc" />
  </svg>
);

// --------------------------------------------------------------------------
// 🎮 메인 채팅 컴포넌트 (로그인 정보 사용)
// --------------------------------------------------------------------------
const GameAIChatContent = () => {
  const [session, setSession] = useState(null); // 세션 상태 관리

  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 초기값: false (모바일 기본)
  const [isLoading, setIsLoading] = useState(false);
  
  // ✨ 모달 상태 관리
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamData, setTeamData] = useState({
    pitchers: { starting: [], relief: [] },
    batters: { lineup: [], bench: [] }
  });

  // 팀 데이터 로드 (백엔드에서)
  useEffect(() => {
    if (isTeamModalOpen && session?.user?.email) {
      fetchTeamData();
    }
  }, [isTeamModalOpen, session]);

  // 백엔드에서 팀 데이터 가져오기
  const fetchTeamData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/team`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.team) {
          setTeamData(data.team);
        }
      }
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
    }
  };

  // 팀 데이터 저장
  const saveTeamData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/team`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalSetDeckScore: parseInt(teamScore) || 0,
          totalOvr: teamOvr || null,
        }),
      });
      if (response.ok) {
        alert('팀 정보가 저장되었습니다!');
        setIsTeamModalOpen(false);
      } else {
        alert('저장 실패: ' + response.statusText);
      }
    } catch (error) {
      console.error('팀 데이터 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ✅ 백엔드 주소 (프로덕션 URL)
  const API_BASE_URL = 'https://api.zask.kr/api';
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Vercel 환경 변수에서 가져올 예정

  // ✨ [초기화] 브라우저 저장소에서 채팅 기록 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem('zask_chat_history');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('기록 로드 실패', e);
      }
    }
    
    // 세션 정보 로드 (localStorage 또는 백엔드에서)
    const loadSession = async () => {
      // 1. localStorage에서 먼저 확인
      const savedSession = localStorage.getItem('zask_session');
      if (savedSession) {
        try {
          setSession(JSON.parse(savedSession));
          return;
        } catch (e) {
          console.error('저장된 세션 로드 실패', e);
        }
      }
      
      // 2. 백엔드에서 세션 확인
      try {
        const response = await fetch('https://api.zask.kr/api/auth/session', {
          credentials: 'include',
        });
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData?.user) {
            setSession(sessionData.user);
            localStorage.setItem('zask_session', JSON.stringify(sessionData.user));
          }
        }
      } catch (error) {
        console.error('백엔드 세션 로드 실패:', error);
      }
    };
    
    loadSession();

    // 화면 크기 감지: 데스크톱이면 사이드바 열기
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize(); // 초기 실행
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✨ [저장] 채팅 기록이 바뀔 때마다 브라우저에 저장
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('zask_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // 피드백 전송 함수
  const sendFeedback = async (type, messageContent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          message: messageContent
        }),
      });

      if (response.ok) {
        alert(`소중한 의견('${type}')을 개발자에게 전송했습니다! 📧`);
      } else {
        alert('피드백 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('피드백 전송 에러:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const loadChat = (id) => {
    const selectedChat = chatHistory.find(chat => chat.id === id);
    if (selectedChat) {
      setActiveChatId(id);
      setMessages(selectedChat.messages);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    const currentMessages = [...messages, userMsg]; 
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = Date.now();
      setActiveChatId(currentChatId);
      setChatHistory(prev => [{ id: currentChatId, title: inputText, messages: [userMsg] }, ...prev]);
    } else {
      setChatHistory(prev => prev.map(chat => chat.id === currentChatId ? { ...chat, messages: [...chat.messages, userMsg] } : chat));
    }

    const tempAiId = Date.now() + 1;
    setMessages(prev => [...prev, { 
      id: tempAiId, 
      sender: 'AI', 
      text: '분석 중입니다... 📡' 
    }]);

    try {
      const apiMessages = currentMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.reply;

      setMessages(prev => prev.map(msg => 
        msg.id === tempAiId ? { ...msg, text: aiResponseText } : msg
      ));

      const finalAiMsg = { id: tempAiId, sender: 'ai', text: aiResponseText };
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, finalAiMsg] }
          : chat
      ));

    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempAiId ? { ...msg, text: `서버 연결 실패.. (Error: ${error.message})` } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, messages, activeChatId, isLoading, API_BASE_URL]);

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputCheck = (e) => {
      setInputText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    const newHistory = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(newHistory);
    localStorage.setItem('zask_chat_history', JSON.stringify(newHistory));
    if (activeChatId === id) handleNewChat();
  };

  // ✨ Google 로그인 함수
  const handleLogin = () => {
    // 백엔드의 NextAuth Google 로그인으로 리다이렉트
    window.location.href = 'https://api.zask.kr/api/auth/signin/google';
  };

  // ✨ 로그인 후 콜백 확인 및 세션 저장
  useEffect(() => {
    // 페이지 로드 시 백엔드에서 현재 세션 확인
    const checkSession = async () => {
      try {
        const response = await fetch('https://api.zask.kr/api/auth/session', {
          method: 'GET',
          credentials: 'include', // 쿠키 포함
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData?.user) {
            console.log('세션 확인됨:', sessionData.user);
            setSession(sessionData.user);
            localStorage.setItem('zask_session', JSON.stringify(sessionData.user));
          }
        } else {
          // 백엔드 실패 시 localStorage에서 로드
          const savedSession = localStorage.getItem('zask_session');
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              setSession(parsed);
            } catch (e) {
              console.error('localStorage 세션 파싱 실패:', e);
            }
          }
        }
      } catch (error) {
        console.error('세션 확인 실패:', error);
        // 에러 발생 시에도 localStorage에서 로드
        const savedSession = localStorage.getItem('zask_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            setSession(parsed);
          } catch (e) {
            console.error('localStorage 세션 파싱 실패:', e);
          }
        }
      }
    };

    // 초기 로드와 로그인 후 (또는 페이지가 다시 보여질 때) 세션 확인
    checkSession();

    const onVisible = () => {
      if (document.visibilityState === 'visible') checkSession();
    };

    window.addEventListener('visibilitychange', onVisible);

    return () => window.removeEventListener('visibilitychange', onVisible);
  }, []);

  // ✨ 로그아웃 함수
  const handleLogout = async () => {
    try {
      await fetch('https://api.zask.kr/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
    setSession(null);
    localStorage.removeItem('zask_session');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-800 font-sans">
      {/* 모바일 오버레이 배경 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* --- 사이드바 --- */}
      <aside 
        className={`bg-[#f9f9f9] border-r border-gray-200 transition-all duration-300 flex flex-col shrink-0 overflow-hidden relative
          ${isSidebarOpen ? 'fixed md:relative inset-0 z-40 md:z-auto w-full md:w-[280px]' : 'hidden md:flex md:w-[280px]'}`}
      >
        <div className="p-4 pt-4">
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors mb-4"
          >
            <Menu size={24} />
          </button>

          <button 
            onClick={handleNewChat}
            className="flex items-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-indigo-600 py-3 px-4 rounded-2xl transition-all shadow-sm w-[150px] group"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 scrollbar-hide mt-2">
          <div className="text-xs font-bold text-gray-400 mb-3 px-3 uppercase tracking-wider">Recent</div>
          {chatHistory.length === 0 ? (
             <div className="text-gray-400 text-xs px-4 py-2">기록이 없습니다.</div>
          ) : (
            chatHistory.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`group flex items-center gap-3 p-2 px-3 rounded-lg cursor-pointer text-sm mb-1 truncate relative transition-colors
                  ${activeChatId === chat.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-200 text-gray-700'}
                `}
              >
                <MessageSquare size={16} className={activeChatId === chat.id ? "text-indigo-500" : "text-gray-400"} />
                <span className="truncate pr-6">{chat.title}</span>
                <button 
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-500 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* --- ✨ 하단: 로그인 & 설정 영역 --- */}
        <div className="p-4 mt-auto space-y-2 border-t border-gray-100 bg-[#f9f9f9]">
          
          {session ? (
            // ✅ 로그인 상태
            <>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl mb-2">
                {session.user.image ? (
                  <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {session.user.name?.[0] || 'U'}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate">{session.user.name}</span>
                  <span className="text-xs text-gray-500 truncate">{session.user.email}</span>
                </div>
              </div>

              <button 
                onClick={() => setIsTeamModalOpen(true)}
                className="w-full flex items-center gap-3 p-2 hover:bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Save size={18} />
                <span>내 팀 관리 (DB)</span>
              </button>

              <button 
                onClick={() => handleLogout()}
                className="w-full flex items-center gap-3 p-2 hover:bg-red-50 text-red-600 rounded-lg text-sm transition-colors"
              >
                <LogOut size={18} />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            // ❌ 비로그인 상태
            <button 
              onClick={() => handleLogin()}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2.5 px-4 rounded-xl transition-all shadow-sm"
            >
              <LogIn size={18} />
              <span className="text-sm font-bold">Google 로그인</span>
            </button>
          )}

          <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer text-sm text-gray-600 mt-2">
            <Settings size={18} />
            <span>설정</span>
          </div>
          <div className="pt-2 text-[10px] text-gray-400 flex items-center gap-1.5 px-2 font-medium">
             <Globe size={10} />
             <span>zask.kr</span>
          </div>
        </div>
      </aside>

      {/* --- 메인 화면 --- */}
      <main className="flex-1 flex flex-col relative h-full min-w-0 bg-white">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 w-full absolute top-0 z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
              >
                <Menu size={24} />
              </button>
            )}
            <div className="flex items-center gap-2 select-none">
              <span className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-1">
                ZASK <span className="text-indigo-600 text-2xl">.</span>
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 cursor-pointer flex items-center justify-center text-white font-bold text-sm shadow-md transition-all">
            Z
          </div>
        </header>

        {/* 채팅 화면 */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
            <div className="mb-6 animate-fade-in-up">
              <div className="relative group cursor-default">
                <div className="absolute -inset-4 bg-indigo-400 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
                <ZaskLogo size={72} className="text-indigo-600 relative drop-shadow-xl transform transition hover:scale-105 duration-300" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center tracking-tight">
              Just ASK
            </h2>

            <div className="w-full max-w-3xl relative animate-fade-in-up z-20">
              <div className="relative flex items-end w-full p-3 bg-[#f4f4f4] rounded-[26px] border border-transparent focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/50 focus-within:shadow-xl transition-all duration-200 ease-in-out">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputCheck}
                  onKeyDown={handleKeyDown}
                  placeholder={session ? "무엇이든 물어보세요..." : "로그인하면 내 팀 정보를 기억해요!"}
                  className="w-full max-h-[200px] min-h-[52px] py-3 pl-4 pr-12 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500 text-lg leading-relaxed focus:ring-0"
                  rows={1}
                  autoFocus
                />
                <button onClick={handleSendMessage} disabled={!inputText.trim() || isLoading} className={`absolute right-3 bottom-3 p-2 rounded-full transition-all duration-200 ${inputText.trim() && !isLoading ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-[#e0e0e0] text-gray-400 cursor-not-allowed'}`}>
                  <Send size={18} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-3xl">
               {['V25 라인업 추천', '리그 순위 분석', '신규 선수 스탯 비교'].map((tag) => (
                 <button key={tag} onClick={() => setInputText(tag)} disabled={isLoading} className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
                   {tag}
                 </button>
               ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto w-full scroll-smooth">
              <div className="max-w-3xl mx-auto px-4 py-24 space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                       <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm"><Sparkles size={16} className="text-white" fill="currentColor" /></div>
                    )}
                    <div className="flex flex-col gap-1 max-w-[85%]">
                      <div className={`py-3 px-5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-[#eff6ff] text-gray-900 rounded-tr-sm ml-auto' : 'text-gray-800'}`}>
                        {msg.text}
                      </div>
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1 mt-1 ml-2 text-gray-400">
                          <button onClick={() => sendFeedback('좋아요', msg.text)} className="p-1.5 hover:bg-gray-100 rounded-md hover:text-indigo-600 transition-colors"><ThumbsUp size={14} /></button>
                          <button onClick={() => sendFeedback('싫어요', msg.text)} className="p-1.5 hover:bg-gray-100 rounded-md hover:text-red-500 transition-colors"><ThumbsDown size={14} /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-md hover:text-gray-700 transition-colors" onClick={() => alert('재생성 기능은 준비 중입니다!')}><RotateCcw size={14} /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-md hover:text-gray-700 transition-colors"><MoreHorizontal size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="w-full bg-white pb-6 pt-2 px-4 z-20 absolute bottom-0">
              <div className="max-w-3xl mx-auto relative">
                <div className="relative flex items-end w-full p-2 bg-[#f4f4f4] rounded-[26px] border border-transparent focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/50 focus-within:shadow-xl transition-all duration-200 ease-in-out">
                   <button className="p-3 text-gray-400 hover:text-indigo-600 rounded-full transition-colors mb-0.5"><Plus size={20} /></button>
                   <textarea value={inputText} onChange={handleInputCheck} onKeyDown={handleKeyDown} placeholder={session ? "Just ASK..." : "로그인이 필요할 수 있습니다."} className="flex-1 max-h-[200px] min-h-[44px] py-3 px-2 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500 text-[15px] leading-relaxed focus:ring-0" rows={1} autoFocus />
                   <button onClick={handleSendMessage} disabled={!inputText.trim() || isLoading} className={`p-2.5 mr-1 mb-1 rounded-full transition-colors ${inputText.trim() && !isLoading ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-transparent text-gray-300'}`}><Send size={18} /></button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✨ 내 팀 관리 모달 (UI만 구현됨) */}
        {isTeamModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative animate-fade-in-up">
              <button onClick={() => setIsTeamModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Save className="text-indigo-600" /> 
                내 팀 정보 관리
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800 flex items-start gap-3">
                  <div className="bg-white p-1.5 rounded-full shadow-sm"><User size={16} className="text-indigo-600"/></div>
                  <div>
                    <p className="font-bold text-lg mb-1">👋 안녕하세요, {session?.user?.name} 구단주님!</p>
                    <p>이곳에 저장된 팀 정보는 AI가 답변할 때 자동으로 참고합니다. 정확하게 입력할수록 더 좋은 조언을 받을 수 있습니다.</p>
                  </div>
                </div>
                
                {/* 팀 정보 입력 폼 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 투수 라인업 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">⚾️</span> 투수 라인업
                    </h3>
                    
                    {/* 선발 투수 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">선발 투수</label>
                      {teamData.pitchers.starting.map((pitcher, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={pitcher}
                            onChange={(e) => {
                              const newStarting = [...teamData.pitchers.starting];
                              newStarting[index] = e.target.value;
                              setTeamData({
                                ...teamData,
                                pitchers: { ...teamData.pitchers, starting: newStarting }
                              });
                            }}
                            placeholder={`선발 투수 ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const newStarting = teamData.pitchers.starting.filter((_, i) => i !== index);
                              setTeamData({
                                ...teamData,
                                pitchers: { ...teamData.pitchers, starting: newStarting }
                              });
                            }}
                            className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setTeamData({
                            ...teamData,
                            pitchers: {
                              ...teamData.pitchers,
                              starting: [...teamData.pitchers.starting, '']
                            }
                          });
                        }}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        + 선발 투수 추가
                      </button>
                    </div>
                    
                    {/* 불펜 투수 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">불펜 투수</label>
                      {teamData.pitchers.relief.map((pitcher, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={pitcher}
                            onChange={(e) => {
                              const newRelief = [...teamData.pitchers.relief];
                              newRelief[index] = e.target.value;
                              setTeamData({
                                ...teamData,
                                pitchers: { ...teamData.pitchers, relief: newRelief }
                              });
                            }}
                            placeholder={`불펜 투수 ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const newRelief = teamData.pitchers.relief.filter((_, i) => i !== index);
                              setTeamData({
                                ...teamData,
                                pitchers: { ...teamData.pitchers, relief: newRelief }
                              });
                            }}
                            className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setTeamData({
                            ...teamData,
                            pitchers: {
                              ...teamData.pitchers,
                              relief: [...teamData.pitchers.relief, '']
                            }
                          });
                        }}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        + 불펜 투수 추가
                      </button>
                    </div>
                  </div>
                  
                  {/* 타자 라인업 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">🦁</span> 타자 라인업
                    </h3>
                    
                    {/* 선발 타자 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">선발 타자</label>
                      {teamData.batters.lineup.map((batter, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={batter}
                            onChange={(e) => {
                              const newLineup = [...teamData.batters.lineup];
                              newLineup[index] = e.target.value;
                              setTeamData({
                                ...teamData,
                                batters: { ...teamData.batters, lineup: newLineup }
                              });
                            }}
                            placeholder={`타자 ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const newLineup = teamData.batters.lineup.filter((_, i) => i !== index);
                              setTeamData({
                                ...teamData,
                                batters: { ...teamData.batters, lineup: newLineup }
                              });
                            }}
                            className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setTeamData({
                            ...teamData,
                            batters: {
                              ...teamData.batters,
                              lineup: [...teamData.batters.lineup, '']
                            }
                          });
                        }}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        + 선발 타자 추가
                      </button>
                    </div>
                    
                    {/* 후보 타자 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">후보 타자</label>
                      {teamData.batters.bench.map((batter, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={batter}
                            onChange={(e) => {
                              const newBench = [...teamData.batters.bench];
                              newBench[index] = e.target.value;
                              setTeamData({
                                ...teamData,
                                batters: { ...teamData.batters, bench: newBench }
                              });
                            }}
                            placeholder={`후보 타자 ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const newBench = teamData.batters.bench.filter((_, i) => i !== index);
                              setTeamData({
                                ...teamData,
                                batters: { ...teamData.batters, bench: newBench }
                              });
                            }}
                            className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setTeamData({
                            ...teamData,
                            batters: {
                              ...teamData.batters,
                              bench: [...teamData.batters.bench, '']
                            }
                          });
                        }}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        + 후보 타자 추가
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => setIsTeamModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">닫기</button>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('https://api.zask.kr/api/team', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include', // 쿠키 포함
                          body: JSON.stringify({ teamData }),
                        });
                        
                        if (response.ok) {
                          alert('팀 정보가 백엔드에 저장되었습니다!');
                          setIsTeamModalOpen(false);
                        } else {
                          alert('저장 실패: ' + response.statusText);
                        }
                      } catch (error) {
                        console.error('팀 데이터 저장 실패:', error);
                        alert('저장 중 오류가 발생했습니다.');
                      }
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                  >
                    <Save size={18} /> 백엔드에 저장하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// src/App.jsx 맨 밑부분

export default function App() {
  return <GameAIChatContent />;
}