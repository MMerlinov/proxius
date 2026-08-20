import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Shield, Settings, MessageSquare, Clock, Copy, Zap, Terminal, Send, User, MoreVertical, FileUp, Folder, Phone, Bell, Command } from 'lucide-react';
import './App.css';

// --- Премиальный звуковой движок (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = (type) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  
  if (type === 'hover') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
  } else if (type === 'click') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'ring') {
    osc.type = 'square'; osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('remote');
  const [incomingCall, setIncomingCall] = useState(false);
  
  // Данные локального профиля
  const localUser = {
    nickname: "DevAdmin",
    status: "В сети, готов к работе",
    id: "842 109 553"
  };

  const recentDevices = [
    { name: "DESKTOP-METRO", notes: "Сервер БД", id: "112 404 991", status: "online", unattended: true },
    { name: "LAPTOP-POOL", notes: "Ноутбук директора", id: "553 882 100", status: "offline", unattended: false }
  ];

  // Симуляция входящего подключения
  useEffect(() => {
    const timer = setTimeout(() => {
      playSound('ring');
      setIncomingCall(true);
    }, 10000); 
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab) => {
    playSound('click');
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      
      {/* Боковая панель */}
      <aside className="sidebar">
        <div className="user-avatar-container" onMouseEnter={() => playSound('hover')} title={localUser.nickname}>
          <User size={24} color="#fff" />
          <div className="status-indicator"></div>
        </div>
        
        <div style={{ height: '20px' }}></div>

        {[
          { id: 'remote', icon: Monitor, label: 'Удаленное управление' },
          { id: 'chat', icon: MessageSquare, label: 'Прямые чаты' },
          { id: 'security', icon: Shield, label: 'Доступ и Безопасность' }
        ].map((item) => (
          <motion.div key={item.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabChange(item.id)} onMouseEnter={() => playSound('hover')} title={item.label}>
            <item.icon size={26} />
          </motion.div>
        ))}

        <div style={{ flex: 1 }}></div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')} onMouseEnter={() => playSound('hover')} title="Настройки">
          <Settings size={26} />
        </motion.div>
      </aside>

      {/* Основной контент */}
      <main className="main-content">
        
        {/* ВКЛАДКА: УДАЛЕННОЕ УПРАВЛЕНИЕ */}
        {activeTab === 'remote' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 30px 0', fontWeight: 300 }}>Рабочая панель <b style={{ color: 'var(--neon-blue)' }}>Proxius</b></h2>
            
            <div className="dashboard-grid">
              <div className="glass-card">
                <div className="card-title"><Terminal size={18} color="var(--neon-blue)" /> {localUser.nickname} (Этот ПК)</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>{localUser.status}</p>
                <div className="id-display">{localUser.id}</div>
                <button className="btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onMouseEnter={() => playSound('hover')} onClick={() => playSound('click')}>
                  <Copy size={16} /> Скопировать ID
                </button>
              </div>

              <div className="glass-card">
                <div className="card-title"><Monitor size={18} color="var(--neon-purple)" /> Подключиться к устройству</div>
                <p style={{ color: 'var(--text-muted)' }}>Введите Proxius ID партнера для управления.</p>
                <div className="input-group">
                  <input type="text" className="modern-input" placeholder="ID или Alias..." />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-gradient" onMouseEnter={() => playSound('hover')} onClick={() => playSound('click')}>
                    Подключиться
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ marginTop: '30px', flex: 1 }}>
              <div className="card-title"><Clock size={18} color="var(--neon-cyan)" /> Недавние сессии и Закладки</div>
              <div className="history-list">
                {recentDevices.map((device, i) => (
                  <div className="history-item" key={i} onMouseEnter={() => playSound('hover')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="status-dot" style={{ background: device.status === 'online' ? '#00ff88' : '#ff4444', width: '10px', height: '10px', borderRadius: '50%' }}></div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{device.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {device.id} • {device.notes}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {device.unattended && <span style={{ padding: '8px', fontSize: '12px', color: '#00ff88', border: '1px solid #00ff88', borderRadius: '6px' }}>Авто-доступ</span>}
                      <button className="btn-outline">Соединиться</button>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ВКЛАДКА: ЧАТЫ И ФАЙЛЫ */}
        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chat-layout">
            <div className="contact-list">
              <h3 style={{ marginBottom: '20px', color: 'var(--neon-cyan)' }}>Контакты</h3>
              {recentDevices.map((dev, i) => (
                <div key={i} className="history-item" style={{ cursor: 'pointer', padding: '10px' }} onMouseEnter={() => playSound('hover')}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{dev.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dev.status === 'online' ? 'В сети' : 'Был недавно'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-window">
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Чат: DESKTOP-METRO</span>
                <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)' }}>
                  <Phone size={20} style={{ cursor: 'pointer' }} title="Аудиовызов" />
                  <FileUp size={20} style={{ cursor: 'pointer' }} title="Отправить файл" />
                  <Folder size={20} style={{ cursor: 'pointer' }} title="Общая папка" />
                </div>
              </div>
              <div style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Выберите контакт для начала P2P общения
              </div>
              <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
                <input type="text" className="modern-input" placeholder="Безопасное E2EE сообщение..." disabled />
                <button className="btn-gradient"><Send size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ВКЛАДКА: НАСТРОЙКИ */}
        {activeTab === 'settings' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <h2 style={{ margin: '0 0 30px 0', fontWeight: 300 }}>Настройки <b style={{ color: 'var(--neon-purple)' }}>Proxius</b></h2>
             <div className="dashboard-grid">
               <div className="glass-card">
                 <div className="card-title"><Settings size={18} color="var(--neon-blue)" /> Общие</div>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                   <input type="checkbox" defaultChecked /> Запускать вместе с Windows
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                   <input type="checkbox" defaultChecked /> Сворачивать в системный трей
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <input type="checkbox" defaultChecked /> Звуковые уведомления
                 </label>
               </div>
               
               <div className="glass-card">
                 <div className="card-title"><Command size={18} color="var(--neon-cyan)" /> О Разработчиках</div>
                 <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                   Proxius — это продукт, созданный с фокусом на скорость, безопасность и дизайн будущего.
                 </p>
                 <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)' }}>
                   <GithubIcon />
                   <TelegramIcon />
                   <InstagramIcon />
                   <FacebookIcon />
                 </div>
               </div>
             </div>
           </motion.div>
        )}

      </main>

      {/* МОДАЛЬНОЕ ОКНО: ВХОДЯЩИЙ ЗАПРОС */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="modal-content">
              <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '20px' }}>
                <Monitor size={48} color="var(--neon-blue)" />
              </div>
              <h2 style={{ marginBottom: '10px' }}>Входящее подключение</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Агент <b>Служба Поддержки</b> (ID: 994 221 001) запрашивает доступ к просмотру и управлению вашим экраном.</p>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button className="btn-outline" style={{ borderColor: '#ff4444', color: '#ff4444' }} onClick={() => { playSound('click'); setIncomingCall(false); }}>
                  Отклонить
                </button>
                <button className="btn-gradient" onClick={() => { playSound('click'); setIncomingCall(false); }}>
                  Разрешить доступ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// === КАСТОМНЫЕ ИКОНКИ ===
const GithubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }} onMouseEnter={() => playSound('hover')}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TelegramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }} onMouseEnter={() => playSound('hover')}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }} onMouseEnter={() => playSound('hover')}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }} onMouseEnter={() => playSound('hover')}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);