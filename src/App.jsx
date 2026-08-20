import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Shield, Settings, MessageSquare, Clock, Copy, Zap, Terminal, Send } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('remote');
  const [messageText, setMessageText] = useState('');
  
  // Тестовые данные (позже свяжем с WebRTC RTCDataChannel)
  const myProxiusId = "842 109 553";
  const [messages, setMessages] = useState([
    { id: 1, text: "Соединение установлено. Канал защищен E2EE шифрованием.", type: "system" },
    { id: 2, text: "Привет! Посмотришь, почему у меня база данных отваливается?", type: "received" }
  ]);

  const recentDevices = [
    { name: "Рабочий Сервер", id: "112 404 991", status: "online" },
    { name: "Ноутбук (Дом)", id: "553 882 100", status: "offline" }
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setMessages([...messages, { id: Date.now(), text: messageText, type: "sent" }]);
    setMessageText('');
    // TODO: Здесь будет вызов dataChannel.send(messageText)
  };

  return (
    <div className="app-container">
      {/* Боковая панель (остается без изменений) */}
      <aside className="sidebar">
        <div style={{ color: 'var(--neon-cyan)', marginBottom: '20px' }}><Zap size={32} /></div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
          className={`nav-item ${activeTab === 'remote' ? 'active' : ''}`}
          onClick={() => setActiveTab('remote')} title="Удаленное управление">
          <Monitor size={26} />
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')} title="Прямые чаты">
          <MessageSquare size={26} />
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="nav-item" title="Безопасность"><Shield size={26} /></motion.div>
        <div style={{ flex: 1 }}></div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="nav-item" title="Настройки"><Settings size={26} /></motion.div>
      </aside>

      <main className="main-content">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ margin: 0, fontSize: '28px', fontWeight: 300 }}>
          {activeTab === 'remote' ? (
            <>Добро пожаловать в <b style={{ color: 'var(--neon-blue)' }}>Proxius</b></>
          ) : (
            <>Прямой <b style={{ color: 'var(--neon-purple)' }}>P2P Чат</b></>
          )}
        </motion.h2>

        <AnimatePresence mode="wait">
          {activeTab === 'remote' ? (
            <motion.div key="remote" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px', height: '100%' }}>
              <div className="dashboard-grid">
                <div className="glass-card">
                  <div className="card-title"><Terminal size={18} color="var(--neon-blue)" /> Рабочее место</div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Ваш Proxius ID:</p>
                  <div className="id-display">{myProxiusId}</div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Copy size={16} /> Скопировать ID
                  </motion.button>
                </div>

                <div className="glass-card">
                  <div className="card-title"><Monitor size={18} color="var(--neon-purple)" /> Удаленное подключение</div>
                  <p style={{ color: 'var(--text-muted)' }}>Введите Proxius ID партнера для управления.</p>
                  <div className="input-group">
                    <input type="text" className="modern-input" placeholder="Например: 123 456 789" />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-gradient">Подключиться</motion.button>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ flex: 1 }}>
                <div className="card-title"><Clock size={18} color="var(--neon-cyan)" /> Недавние сессии</div>
                <div className="history-list">
                  {recentDevices.map((device, index) => (
                    <div className="history-item" key={index}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="status-dot" style={{ background: device.status === 'online' ? '#00ff88' : '#ff4444', boxShadow: `0 0 10px ${device.status === 'online' ? '#00ff88' : '#ff4444'}` }}></div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{device.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>ID: {device.id}</div>
                        </div>
                      </div>
                      <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Соединиться</button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="chat-wrapper">
              <div className="chat-header">
                <div className="status-dot"></div>
                <span style={{ fontWeight: 'bold' }}>Рабочий Сервер</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>(112 404 991)</span>
              </div>
              
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.type}`}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Введите сообщение..." 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  className="btn-gradient" 
                  style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={handleSendMessage}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}