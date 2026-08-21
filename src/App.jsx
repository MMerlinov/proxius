import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Shield, Settings, Copy, Zap, Terminal, User, Activity, CheckCircle2, Lock, Mic, Keyboard, Volume2 } from 'lucide-react';
import './App.css';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

export default function App() {
  const [activeTab, setActiveTab] = useState('remote');
  const [toasts, setToasts] = useState([]);
  const [partnerId, setPartnerId] = useState('');
  
  // Управление аппаратными функциями
  const [voiceControl, setVoiceControl] = useState(false);
  
  const localUser = { nickname: "DevAdmin", id: "842 109 553" };
  const recentDevices = [
    { name: "DESKTOP-METRO", id: "112 404 991", online: true },
    { name: "LAPTOP-POOL", id: "553 882 100", online: false }
  ];

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(localUser.id);
    showToast("ID скопирован в буфер обмена");
  };

  const toggleVoiceControl = () => {
    const newState = !voiceControl;
    setVoiceControl(newState);
    showToast(newState ? "Служба Speech-to-Text активирована" : "Голосовой ввод отключен");
  };

  return (
    <>
      <div className="custom-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
          <Zap size={16} color="var(--text-main)"/> PROXIUS
        </div>
        <div className="titlebar-drag-region"></div>
        <div className="titlebar-controls">
          <button className="win-ctrl-btn neu-flat" onClick={() => ipcRenderer?.send('window-minimize')} title="Свернуть"></button>
          <button className="win-ctrl-btn neu-flat" onClick={() => ipcRenderer?.send('window-maximize')} title="Развернуть"></button>
          <button className="win-ctrl-btn neu-flat close" onClick={() => ipcRenderer?.send('window-close')} title="Закрыть"></button>
        </div>
      </div>

      <div className="app-container">
        
        <aside className="sidebar">
          <div className="avatar-neu neu-flat" onClick={() => showToast("Профиль")}>
            <User size={24} />
          </div>
          
          <div style={{ height: '10px' }}></div>

          {[
            { id: 'remote', icon: Monitor, label: 'Удаленное управление' },
            { id: 'security', icon: Shield, label: 'Безопасность' },
            { id: 'settings', icon: Settings, label: 'Настройки' }
          ].map((item) => (
            <div key={item.id} className={`nav-item neu-flat ${activeTab === item.id ? 'active' : ''}`} 
                 onClick={() => setActiveTab(item.id)} title={item.label}>
              <item.icon size={22} />
            </div>
          ))}
        </aside>

        <main className="main-content">
          
          <div className="header-panel">
            <h2 style={{ margin: 0, fontWeight: 300, fontSize: '24px' }}>Рабочая панель</h2>
            <div className="status-pill neu-pressed">
              <Activity size={16} color="var(--accent-cyan)" /> Relay: MSK-01 • Ping: 12ms
            </div>
          </div>

          <div className="dashboard-grid">
            
            {/* Карточка 1: Свой ПК */}
            <div className="panel-card neu-flat">
              <div className="panel-title"><Terminal size={18} /> {localUser.nickname}</div>
              <div className="id-display">{localUser.id}</div>
              <button className="neu-button" style={{ padding: '16px' }} onClick={handleCopyId}>
                <Copy size={18} /> Скопировать ID
              </button>
            </div>

            {/* Карточка 2: Подключение */}
            <div className="panel-card neu-flat">
              <div className="panel-title"><Monitor size={18} /> Подключиться</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Укажите Proxius ID партнера для запроса удаленного управления.
              </div>
              <input type="text" className="neu-input neu-pressed" placeholder="ID или Alias..." 
                     value={partnerId} onChange={(e) => setPartnerId(e.target.value)}
                     style={{ marginBottom: '20px' }} />
              <button className="neu-button" style={{ padding: '16px', color: 'var(--accent-cyan)' }} onClick={() => showToast(`Соединение с ${partnerId}...`)}>
                Установить соединение
              </button>
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginTop: '10px' }}>
            
            {/* Блок аппаратного управления */}
            <div className="panel-card neu-flat">
              <div className="panel-title"><Keyboard size={18} /> Управление и Ввод</div>
              <div className="control-group">
                <div className="control-row">
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Распознавание речи (Speech-to-Text)</span>
                  <button className={`neu-button ${voiceControl ? 'active-toggle' : ''}`} style={{ padding: '10px 15px' }} onClick={toggleVoiceControl}>
                    <Mic size={16} /> {voiceControl ? 'Вкл' : 'Выкл'}
                  </button>
                </div>
                <div className="control-row">
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Активация микрофона по Hotkey</span>
                  <div className="neu-pressed" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>Ctrl + Space</div>
                </div>
                <div className="control-row">
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Звук системы при подключении</span>
                  <button className="neu-button" style={{ padding: '10px 15px' }}><Volume2 size={16} /></button>
                </div>
              </div>
            </div>

            {/* История */}
            <div className="panel-card neu-flat">
              <div className="panel-title"><Zap size={18} /> Недавние устройства</div>
              <div>
                {recentDevices.map((device, i) => (
                  <div className="list-item neu-flat" key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className={`indicator ${device.online ? 'online' : ''}`}></div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{device.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{device.id}</div>
                      </div>
                    </div>
                    <button className="neu-button" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => showToast(`Подключение...`)}>Коннект</button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>

      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="toast neu-flat">
              <CheckCircle2 size={18} color="var(--accent-cyan)" /> {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}