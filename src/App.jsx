import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Shield, Settings, Copy, Zap, Terminal, User, CheckCircle2, Lock, Mic, Keyboard, Cpu, Radio, Palette, X, Save, Edit3, Download, Upload, ShieldAlert, Sliders, Maximize2, Volume2, VolumeX, ShieldCheck, MousePointer, Layers, CornerDownLeft, Power, ChevronUp, ChevronDown, FolderOpen, MessageSquare, Folder, FileText, Send, Plus, Clipboard, Network, Activity, History, Video, Tag, HardDrive } from 'lucide-react';
import './App.css';

import sound1 from './assets/1.mp3';
import sound2 from './assets/2.mp3';
import sound3 from './assets/3.mp3';

const electron = window.require ? window.require('electron') : null;
const { ipcRenderer } = electron || {};
const os = electron ? window.require('os') : null;

const playAudio = (fileIndex) => {
  try {
    const files = [null, sound1, sound2, sound3];
    if (files[fileIndex]) {
      const audio = new Audio(files[fileIndex]);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  } catch (e) {
    console.log("Ошибка воспроизведения звука");
  }
};

const STATUSES = {
  online: { label: 'В сети', color: '#00ff88' },
  busy: { label: 'Занят', color: '#ff4d4d' },
  support: { label: 'Ожидает поддержки', color: '#00e5ff' },
  invisible: { label: 'Невидимый', color: '#8b92a5' },
  offline: { label: 'Офлайн', color: '#555b6e' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('remote');
  const [themeIndex, setThemeIndex] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [partnerId, setPartnerId] = useState('');

  // Мультисессионность
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Модальные окна и фичи
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClipboardOpen, setIsClipboardOpen] = useState(false);
  const [isPortForwardOpen, setIsPortForwardOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isWebShellOpen, setIsWebShellOpen] = useState(false);

  // Буфер обмена
  const [clipboardHistory, setClipboardHistory] = useState([
    'PROXIUS_SECURE_TOKEN_9921',
    'C:\\Proxius\\Workspace\\config.json',
    'ssh root@192.168.1.50 -p 2222'
  ]);
  const [clipboardInput, setClipboardInput] = useState('');

  // Порт-форвардинг
  const [portForwards, setPortForwards] = useState([
    { localPort: 8080, remotePort: 80, active: true, name: 'Web Dashboard' },
    { localPort: 5432, remotePort: 5432, active: false, name: 'PostgreSQL DB' }
  ]);
  const [newLocalPort, setNewLocalPort] = useState('');
  const [newRemotePort, setNewRemotePort] = useState('');
  const [newPortName, setNewPortName] = useState('');

  // Web Shell стейт
  const [shellCommands, setShellCommands] = useState([
    { type: 'out', text: 'Proxius Secure Shell v2.4 (x86_64-pc-windows-msvc)' },
    { type: 'out', text: 'Type "help" to see available commands or "top" for telemetry.' }
  ]);
  const [shellInput, setShellInput] = useState('');

  // Аудит, пинг и удаленный HUD
  const [auditLogs, setAuditLogs] = useState([
    { time: '13:42:10', type: 'CONNECT', text: 'Успешный туннель с 112-404-991 (AES-256)' },
    { time: '13:42:15', type: 'FILE', text: 'Передан файл: database_dump.sql' },
    { time: '13:45:00', type: 'PORT', text: 'Проброшен порт localhost:8080 -> 80' }
  ]);
  const [currentPing, setCurrentPing] = useState(11);
  const [remoteHud, setRemoteHud] = useState({ cpu: 28, ram: 44, temp: '42°C', gpu: '12%' });

  // Чат
  const [chatMessages, setChatMessages] = useState([
    { sender: 'remote', text: 'Здравствуйте! Готов к работе через мультисессионный шлюз.' },
    { sender: 'local', text: 'Туннель запущен. Порты и буфер синхронизированы.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Устройства с тегами
  const [devices, setDevices] = useState([
    { id: '112-404-991', name: 'DESKTOP-METRO', alias: 'Главный сервер', tag: 'Production', note: 'Доступ по шлюзу MSK', online: true, cpu: 24, ram: 42 },
    { id: '553-882-100', name: 'LAPTOP-POOL', alias: 'Ноутбук тест', tag: 'Testing', note: 'Резервная точка', online: false, cpu: 0, ram: 0 }
  ]);
  const [selectedTagFilter, setSelectedTagFilter] = useState('All');
  const [editingDevice, setEditingDevice] = useState(null);

  const [systemHostname] = useState(os ? os.hostname() : 'PROXIUS-HOST-PC');
  const [nickname, setNickname] = useState(localStorage.getItem('proxius_nick') || 'DevAdmin');
  const [userStatus, setUserStatus] = useState('online');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    e2eEncryption: true,
    requirePin: true,
    ipWhitelist: '192.168.1.0/24',
    autoLockMinutes: 15
  });

  const [sysConfig, setSysConfig] = useState({
    autoStart: true,
    hwAcceleration: true,
    streamQuality: 'ultra',
    audioMuted: false
  });

  const [voiceActive, setVoiceActive] = useState(false);
  const [dynamicPin] = useState('4829');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const themes = [
    { id: 'graphite', name: 'Graphite Steel' },
    { id: 'amber', name: 'Cyber Amber' },
    { id: 'frost', name: 'Arctic Frost' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon' },
    { id: 'space', name: 'Deep Space' },
    { id: 'mocha', name: 'Soft Mocha' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('proxius_theme');
    if (savedTheme) {
      const idx = themes.findIndex(t => t.id === savedTheme);
      if (idx !== -1) {
        setThemeIndex(idx);
        document.documentElement.setAttribute('data-theme', savedTheme === 'graphite' ? '' : savedTheme);
      }
    }

    const pingInterval = setInterval(() => {
      setCurrentPing(Math.floor(Math.random() * 8) + 9);
      setRemoteHud({
        cpu: Math.floor(Math.random() * 20) + 20,
        ram: 45 + Math.floor(Math.random() * 5),
        temp: `${40 + Math.floor(Math.random() * 5)}°C`,
        gpu: `${10 + Math.floor(Math.random() * 15)}%`
      });
    }, 3000);
    return () => clearInterval(pingInterval);
  }, []);

  const nextTheme = () => {
    playAudio(1);
    const nextIdx = (themeIndex + 1) % themes.length;
    setThemeIndex(nextIdx);
    const t = themes[nextIdx];
    document.documentElement.setAttribute('data-theme', t.id === 'graphite' ? '' : t.id);
    localStorage.setItem('proxius_theme', t.id);
    showToast(`Тема оформлена: ${t.name}`);
  };

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleCopyId = () => {
    playAudio(2);
    navigator.clipboard.writeText("842-109-553");
    showToast("ID узла скопирован в буфер");
  };

  const handleConnect = (targetId = partnerId) => {
    const idToConnect = targetId || '112-404-991';
    playAudio(3);

    const newSessionId = `sess_${Date.now().toString().slice(-4)}`;
    const newSession = {
      id: newSessionId,
      partnerId: idToConnect,
      status: 'connecting',
      inputBlocked: false,
      audioMuted: false,
      qualityMode: 'Ultra',
      toolbarCollapsed: false,
      isRecording: false
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSessionId);
    showToast(`Установка защищенного туннеля с ${idToConnect}...`);

    setTimeout(() => {
      setSessions(prev => prev.map(s => s.id === newSessionId ? { ...s, status: 'handshake' } : s));
    }, 1000);

    setTimeout(() => {
      setSessions(prev => prev.map(s => s.id === newSessionId ? { ...s, status: 'active' } : s));
      setAuditLogs(prev => [{ time: new Date().toLocaleTimeString(), type: 'CONNECT', text: `Туннель с ${idToConnect} успешно установлен` }, ...prev]);
      showToast(`Туннель с узлом ${idToConnect} активен.`);
    }, 2400);
  };

  const closeSession = (sessionId) => {
    playAudio(1);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
    showToast("Сеанс связи завершен");
  };

  const updateActiveSession = (key, val) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, [key]: val } : s));
  };

  const currentSession = sessions.find(s => s.id === activeSessionId);

  const toggleFullscreen = () => {
    playAudio(2);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      showToast("Полноэкранный режим включен");
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      showToast("Полноэкранный режим выключен");
    }
  };

  const sendShellCommand = (e) => {
    e.preventDefault();
    if (!shellInput.trim()) return;
    playAudio(2);
    const cmd = shellInput.trim();
    let response = `Executing command: ${cmd}... OK.`;
    if (cmd === 'help') response = 'Available commands: top, ping, services, clear, docker ps';
    if (cmd === 'top') response = `CPU: ${remoteHud.cpu}% | RAM: ${remoteHud.ram}% | TEMP: ${remoteHud.temp}`;
    if (cmd === 'clear') {
      setShellCommands([]);
      setShellInput('');
      return;
    }

    setShellCommands(prev => [...prev, { type: 'in', text: `> ${cmd}` }, { type: 'out', text: response }]);
    setShellInput('');
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    playAudio(2);
    setChatMessages(prev => [...prev, { sender: 'local', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'remote', text: 'Принято, выполняю задачу.' }]);
    }, 1000);
  };

  const exportConfig = () => {
    playAudio(2);
    const configData = JSON.stringify({ securitySettings, sysConfig, nickname }, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxius-config-${systemHostname}.json`;
    a.click();
    showToast("Конфигурация экспортирована");
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.securitySettings) setSecuritySettings(parsed.securitySettings);
        if (parsed.sysConfig) setSysConfig(parsed.sysConfig);
        if (parsed.nickname) setNickname(parsed.nickname);
        playAudio(2);
        showToast("Конфигурация загружена");
      } catch (err) {
        showToast("Ошибка чтения файла");
      }
    };
    reader.readAsText(file);
  };

  const filteredDevices = selectedTagFilter === 'All' ? devices : devices.filter(d => d.tag === selectedTagFilter);

  return (
    <>
      <div className="custom-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
          <Zap size={16} color="var(--accent-color)"/> PROXIUS <span style={{ fontSize: '10px', opacity: 0.6 }}>E2E SECURE OMNI v3.1</span>
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
          <div className="avatar-neu neu-flat" onClick={() => { playAudio(1); setIsProfileOpen(true); }} title="Профиль и статус">
            <User size={22} />
            <div className="status-indicator" style={{ backgroundColor: STATUSES[userStatus].color }}></div>
          </div>
          
          <div style={{ height: '5px' }}></div>

          {[
            { id: 'remote', icon: Monitor, label: 'Удаленное управление' },
            { id: 'security', icon: Shield, label: 'Безопасность и доступы' },
            { id: 'settings', icon: Settings, label: 'Системные настройки' }
          ].map((item) => (
            <div key={item.id} className={`nav-item neu-flat ${activeTab === item.id ? 'active' : ''}`} 
                 onClick={() => { playAudio(1); setActiveTab(item.id); }} title={item.label}>
              <item.icon size={20} />
            </div>
          ))}

          <div style={{ flex: 1 }}></div>

          <div className="nav-item neu-flat" onClick={nextTheme} title={`Тема: ${themes[themeIndex].name}`}>
            <Palette size={20} color="var(--accent-color)" />
          </div>
        </aside>

        <main className="main-content">
          
          <div className="header-panel">
            <h2 style={{ margin: 0, fontWeight: 300, fontSize: '22px' }}>
              {activeTab === 'remote' && 'Панель управления'}
              {activeTab === 'security' && 'Безопасность и сети'}
              {activeTab === 'settings' && 'Системные параметры'}
            </h2>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="status-pill neu-pressed" title="Шифрование AES-256 Active">
                <Lock size={14} color="var(--accent-color)" /> E2E Secure
              </div>
              <div className="ping-telemetry-pill neu-pressed">
                <Activity size={14} color="var(--accent-color)" /> MSK Relay • {currentPing}ms
              </div>
            </div>
          </div>

          {activeTab === 'remote' && (
            <>
              <div className="dashboard-grid">
                <div className="panel-card neu-flat">
                  <div className="panel-title"><Terminal size={16} /> {systemHostname} ({nickname})</div>
                  <div className="id-display">842-109-553</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="neu-button" style={{ flex: 1, padding: '14px' }} onClick={handleCopyId}>
                      <Copy size={16} /> Копировать ID
                    </button>
                    <div className="neu-pressed" style={{ padding: '0 15px', display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }} title="Динамический PIN">
                      PIN: <b style={{ color: 'var(--accent-color)', marginLeft: '6px' }}>{dynamicPin}</b>
                    </div>
                  </div>
                </div>

                <div className="panel-card neu-flat">
                  <div className="panel-title"><Monitor size={16} /> Подключиться к хосту</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
                    Введите ID или выберите узел для создания вкладки сеанса.
                  </div>
                  <input type="text" className="neu-input neu-pressed" placeholder="Введите ID (например, 112-404-991)..." 
                         value={partnerId} onChange={(e) => setPartnerId(e.target.value)}
                         style={{ marginBottom: '15px' }} />
                  <button className="neu-button" style={{ padding: '14px', color: 'var(--accent-color)' }} onClick={() => handleConnect(partnerId)}>
                    Установить соединение
                  </button>
                </div>
              </div>

              <div className="dashboard-grid" style={{ marginTop: '5px' }}>
                <div className="panel-card neu-flat">
                  <div className="panel-title" style={{ justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Cpu size={16} /> Избранные узлы сети</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['All', 'Production', 'Testing'].map(tag => (
                        <button key={tag} className={`neu-button ${selectedTagFilter === tag ? 'active-toggle' : ''}`} style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => setSelectedTagFilter(tag)}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    {filteredDevices.map((dev, i) => (
                      <div key={i} className="neu-pressed" style={{ padding: '15px', borderRadius: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{dev.name}</span>
                            {dev.alias && <span style={{ fontSize: '12px', color: 'var(--accent-color)', marginLeft: '8px' }}>[{dev.alias}]</span>}
                            <span style={{ fontSize: '11px', color: 'var(--accent-color)', marginLeft: '8px', padding: '2px 6px', background: 'rgba(0,229,255,0.1)', borderRadius: '4px' }}>{dev.tag}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="neu-button" style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--accent-color)' }} onClick={() => handleConnect(dev.id)}>
                              Подключить
                            </button>
                            <button className="neu-button" style={{ width: '28px', height: '28px' }} onClick={() => setEditingDevice(dev)} title="Редактировать">
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </div>
                        {dev.note && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Заметка: {dev.note}</div>}
                        
                        <div className="telemetry-row">
                          <span>CPU Load</span>
                          <div className="progress-bar-bg neu-flat"><div className="progress-bar-fill" style={{ width: `${dev.cpu}%` }}></div></div>
                          <span style={{ width: '35px', textAlign: 'right' }}>{dev.cpu}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-card neu-flat">
                  <div className="panel-title"><Keyboard size={16} /> Голосовые макросы и AI-диктовка</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
                    Нажмите горячую клавишу <b style={{ color: 'var(--accent-color)' }}>Ctrl + Space</b> для голосового управления.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="neu-pressed" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Распознавание речи
                        {voiceActive && (
                          <div className="voice-waveform">
                            <div className="waveform-bar"></div>
                            <div className="waveform-bar"></div>
                            <div className="waveform-bar"></div>
                            <div className="waveform-bar"></div>
                            <div className="waveform-bar"></div>
                          </div>
                        )}
                      </span>
                      <button className={`neu-button ${voiceActive ? 'active-toggle' : ''}`} style={{ padding: '8px 14px', fontSize: '12px' }} onClick={() => { playAudio(2); setVoiceActive(!voiceActive); showToast(!voiceActive ? 'Голосовой движок активен' : 'Диктовка остановлена'); }}>
                        <Mic size={14} /> {voiceActive ? 'Слушаю...' : 'Выключено'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="dashboard-grid">
              <div className="panel-card neu-flat">
                <div className="panel-title"><ShieldAlert size={16} /> Политики безопасности туннеля</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="neu-pressed" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>Строгое E2E Шифрование AES-256</span>
                    <input type="checkbox" checked={securitySettings.e2eEncryption} onChange={(e) => setSecuritySettings({...securitySettings, e2eEncryption: e.target.checked})} />
                  </div>
                  <div className="neu-pressed" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>Запрос динамического PIN при входе</span>
                    <input type="checkbox" checked={securitySettings.requirePin} onChange={(e) => setSecuritySettings({...securitySettings, requirePin: e.target.checked})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Белый список IP-адресов подсети</label>
                    <input type="text" className="neu-input neu-pressed" value={securitySettings.ipWhitelist} onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="panel-card neu-flat">
                <div className="panel-title"><Download size={16} /> Конфигурация и Аудит</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="neu-button" style={{ padding: '12px', color: 'var(--accent-color)' }} onClick={() => setIsAuditLogOpen(true)}>
                    <History size={16} /> Открыть Журнал Аудита (Audit Logs)
                  </button>
                  <button className="neu-button" style={{ padding: '12px', color: 'var(--text-main)' }} onClick={exportConfig}>
                    <Download size={16} /> Экспорт конфигурации (.json)
                  </button>
                  <label className="neu-button" style={{ padding: '12px', color: 'var(--text-main)', textAlign: 'center', cursor: 'pointer' }}>
                    <Upload size={16} /> Импорт конфигурации
                    <input type="file" accept=".json" onChange={importConfig} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="dashboard-grid">
              <div className="panel-card neu-flat">
                <div className="panel-title"><Sliders size={16} /> Системные параметры рендеринга</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="neu-pressed" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>Автозапуск вместе с системой</span>
                    <input type="checkbox" checked={sysConfig.autoStart} onChange={(e) => setSysConfig({...sysConfig, autoStart: e.target.checked})} />
                  </div>
                  <div className="neu-pressed" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>Аппаратное ускорение рендеринга</span>
                    <input type="checkbox" checked={sysConfig.hwAcceleration} onChange={(e) => setSysConfig({...sysConfig, hwAcceleration: e.target.checked})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* МОДАЛЬНОЕ ОКНО ПРОФИЛЯ */}
          {isProfileOpen && (
            <div className="modal-overlay">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-card neu-flat">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="panel-title" style={{ margin: 0 }}><User size={18} /> Профиль и Статус</div>
                  <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsProfileOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Кастомный никнейм</label>
                    <input type="text" className="neu-input neu-pressed" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Сетевой статус</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {Object.entries(STATUSES).map(([key, val]) => (
                        <button key={key} className={`neu-button ${userStatus === key ? 'active-toggle' : ''}`} style={{ padding: '10px', fontSize: '12px', justifyContent: 'flex-start' }} onClick={() => setUserStatus(key)}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: val.color }}></span>
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="neu-button" style={{ padding: '14px', color: 'var(--accent-color)', marginTop: '10px' }} onClick={() => { localStorage.setItem('proxius_nick', nickname); setIsProfileOpen(false); showToast("Профиль сохранен"); }}>
                  <Save size={16} /> Сохранить
                </button>
              </motion.div>
            </div>
          )}

          {/* ЖУРНАЛ АУДИТА */}
          {isAuditLogOpen && (
            <div className="modal-overlay">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-card neu-flat" style={{ width: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="panel-title" style={{ margin: 0 }}><History size={18} /> Журнал аудита соединений</div>
                  <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsAuditLogOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {auditLogs.map((log, i) => (
                    <div key={i} className="neu-pressed" style={{ padding: '10px 14px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
                      <span style={{ color: 'var(--accent-color)' }}>[{log.time}]</span>
                      <span style={{ flex: 1, marginLeft: '15px' }}>{log.text}</span>
                      <span style={{ opacity: 0.6, fontSize: '10px' }}>{log.type}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* МУЛЬТИСЕССИОННЫЙ ИНТЕРФЕЙС УДАЛЕННОГО ДОСТУПА */}
          {sessions.length > 0 && (
            <div className="session-overlay" style={{ display: 'flex', flexDirection: 'column' }}>
              
              <div className="session-tabs-bar">
                {sessions.map((sess) => (
                  <div key={sess.id} className={`session-tab ${activeSessionId === sess.id ? 'active' : ''}`} onClick={() => setActiveSessionId(sess.id)}>
                    <Monitor size={14} /> Узел: {sess.partnerId}
                    <span onClick={(e) => { e.stopPropagation(); closeSession(sess.id); }} style={{ marginLeft: '8px', opacity: 0.6 }}>✕</span>
                  </div>
                ))}
              </div>

              {currentSession && (
                <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                     onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                     onDragLeave={() => setIsDraggingFile(false)}
                     onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); playAudio(2); showToast("Файл успешно передан через P2P туннель!"); }}>
                  
                  {isDraggingFile && (
                    <div className="dropzone-overlay">
                      <Upload size={48} />
                      <div style={{ fontSize: '18px' }}>Перетащите файл для мгновенной P2P отправки</div>
                    </div>
                  )}

                  {/* LIVE HUD МОНИТОРИНГ */}
                  <div className="hud-overlay-box neu-flat">
                    <div className="hud-metric-row"><span style={{ color: 'var(--text-muted)' }}>CPU:</span> <b>{remoteHud.cpu}%</b></div>
                    <div className="hud-metric-row"><span style={{ color: 'var(--text-muted)' }}>RAM:</span> <b>{remoteHud.ram}%</b></div>
                    <div className="hud-metric-row"><span style={{ color: 'var(--text-muted)' }}>TEMP:</span> <b style={{ color: 'var(--accent-color)' }}>{remoteHud.temp}</b></div>
                    <div className="hud-metric-row"><span style={{ color: 'var(--text-muted)' }}>GPU:</span> <b>{remoteHud.gpu}</b></div>
                  </div>

                  {/* Верхняя панель инструментов */}
                  <div className={`session-toolbar neu-flat ${currentSession.toolbarCollapsed ? 'collapsed' : ''}`}>
                    <div className="toolbar-group">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '12px', color: 'var(--accent-color)', paddingRight: '10px' }}>
                        <ShieldCheck size={16} /> {currentSession.partnerId}
                      </div>

                      {currentSession.isRecording && (
                        <div className="dvr-recording-badge">
                          <Video size={12} /> REC
                        </div>
                      )}

                      <button className={`toolbar-btn neu-button ${currentSession.inputBlocked ? 'active-toggle' : ''}`} onClick={() => { updateActiveSession('inputBlocked', !currentSession.inputBlocked); showToast(!currentSession.inputBlocked ? 'Ввод заблокирован' : 'Ввод разблокирован'); }}>
                        <MousePointer size={13} color={currentSession.inputBlocked ? 'var(--accent-danger)' : 'inherit'} /> {currentSession.inputBlocked ? 'Блок' : 'Ввод'}
                      </button>
                      <button className="toolbar-btn neu-button" onClick={() => { playAudio(2); showToast("Ctrl+Alt+Del отправлено"); }}>
                        <CornerDownLeft size={13} /> CAD
                      </button>

                      <button className="toolbar-btn neu-button" onClick={() => {
                        const rec = !currentSession.isRecording;
                        updateActiveSession('isRecording', rec);
                        playAudio(2);
                        showToast(rec ? 'Запись сеанса (DVR) начата' : 'Запись сохранена');
                      }}>
                        <Video size={13} color={currentSession.isRecording ? '#ff4d4d' : 'inherit'} /> {currentSession.isRecording ? 'Стоп' : 'DVR'}
                      </button>

                      <button className="toolbar-btn neu-button" onClick={() => { playAudio(1); setIsWebShellOpen(!isWebShellOpen); }}>
                        <Terminal size={13} /> Shell
                      </button>

                      <button className="toolbar-btn neu-button" onClick={() => { playAudio(1); setIsFileManagerOpen(true); }}>
                        <FolderOpen size={13} /> Файлы
                      </button>
                      <button className="toolbar-btn neu-button" onClick={() => { playAudio(1); setIsClipboardOpen(true); }}>
                        <Clipboard size={13} /> Буфер
                      </button>
                      <button className="toolbar-btn neu-button" onClick={() => { playAudio(1); setIsPortForwardOpen(true); }}>
                        <Network size={13} /> Порты
                      </button>
                      <button className="toolbar-btn neu-button" onClick={() => { playAudio(1); setIsChatOpen(true); }}>
                        <MessageSquare size={13} /> Чат
                      </button>
                    </div>

                    <div className="toolbar-group">
                      <button className="toolbar-btn neu-button" onClick={() => {
                        const modes = ['Ultra', 'Balanced', 'Economy'];
                        const next = modes[(modes.indexOf(currentSession.qualityMode) + 1) % modes.length];
                        updateActiveSession('qualityMode', next);
                        showToast(`Качество: ${next}`);
                      }}>
                        <Sliders size={13} /> {currentSession.qualityMode}
                      </button>
                      <button className="toolbar-btn neu-button" onClick={toggleFullscreen}>
                        <Maximize2 size={13} />
                      </button>
                      <button className="toolbar-btn neu-button" style={{ color: 'var(--accent-danger)' }} onClick={() => closeSession(currentSession.id)}>
                        <Power size={13} /> Закрыть
                      </button>
                    </div>
                  </div>

                  {/* Холст рабочего стола */}
                  <div className="session-viewport">
                    {currentSession.status !== 'active' ? (
                      <div className="connecting-modal neu-flat">
                        <div className="spinner-ring"></div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Установка защищенного туннеля...</div>
                      </div>
                    ) : (
                      <div className="remote-desktop-canvas">
                        <div style={{ opacity: 0.3, textAlign: 'center' }}>
                          <Monitor size={64} style={{ marginBottom: '15px' }} />
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>УДАЛЕННЫЙ РАБОЧИЙ СТОЛ: {currentSession.partnerId}</div>
                          <div style={{ marginTop: '5px', fontSize: '13px' }}>Шифрование E2E • Пинг: {currentPing}ms • 60 FPS</div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* WEB SHELL МОДАЛКА */}
              {isWebShellOpen && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-card neu-flat" style={{ width: '650px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="panel-title" style={{ margin: 0 }}><Terminal size={18} /> Удаленный Web Shell</div>
                      <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsWebShellOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>

                    <div className="web-shell-container">
                      <div className="shell-output">
                        {shellCommands.map((sc, i) => (
                          <div key={i} style={{ color: sc.type === 'in' ? '#00e5ff' : '#00ff88' }}>{sc.text}</div>
                        ))}
                      </div>
                      <form onSubmit={sendShellCommand} className="shell-input-line">
                        <span style={{ color: '#00e5ff', marginRight: '8px' }}>$</span>
                        <input type="text" value={shellInput} onChange={(e) => setShellInput(e.target.value)} placeholder="Введите команду..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', flex: 1, fontFamily: 'monospace', fontSize: '12px' }} />
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ФАЙЛОВЫЙ МЕНЕДЖЕР */}
              {isFileManagerOpen && (
                <motion.div drag dragMomentum={false} className="floating-window">
                  <div className="floating-window-header">
                    <div className="panel-title" style={{ margin: 0 }}><FolderOpen size={18} color="var(--accent-color)" /> Диспетчер файлов Proxius E2E</div>
                    <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsFileManagerOpen(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="fm-container">
                    <div className="fm-pane">
                      <div style={{ fontSize: '12px', color: 'var(--accent-color)', marginBottom: '8px', fontWeight: 'bold' }}>Ваш ПК</div>
                      <div className="fm-file-list">
                        <div className="fm-item" onClick={() => showToast("Передача конфига...")}><FileText size={14}/> config_backup.json</div>
                      </div>
                    </div>
                    <div className="fm-pane">
                      <div style={{ fontSize: '12px', color: 'var(--accent-danger)', marginBottom: '8px', fontWeight: 'bold' }}>Удаленный узел</div>
                      <div className="fm-file-list">
                        <div className="fm-item" onClick={() => showToast("Скачивание логов...")}><FileText size={14}/> database_dump.sql</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* БУФЕР ОБМЕНА */}
              {isClipboardOpen && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-card neu-flat" style={{ width: '450px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div className="panel-title" style={{ margin: 0 }}><Clipboard size={18} /> История буфера обмена</div>
                      <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsClipboardOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="clipboard-history-list">
                      {clipboardHistory.map((item, idx) => (
                        <div key={idx} className="clipboard-item" onClick={() => { navigator.clipboard.writeText(item); playAudio(2); showToast("Скопировано"); }}>
                          <span style={{ fontFamily: 'monospace' }}>{item}</span>
                          <Copy size={14} color="var(--accent-color)" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ПОРТ-ФОРВАРДИНГ */}
              {isPortForwardOpen && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-card neu-flat" style={{ width: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div className="panel-title" style={{ margin: 0 }}><Network size={18} /> Туннелирование портов</div>
                      <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsPortForwardOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {portForwards.map((pf, idx) => (
                        <div key={idx} className="neu-pressed" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <div>
                            <span style={{ fontWeight: 'bold' }}>{pf.name}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>localhost:{pf.localPort} ➔ remote:{pf.remotePort}</div>
                          </div>
                          <button className={`neu-button ${pf.active ? 'active-toggle' : ''}`} style={{ padding: '6px 12px', fontSize: '11px' }}>{pf.active ? 'Активен' : 'Выключен'}</button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ЧАТ СЕАНСА */}
              {isChatOpen && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="chat-window neu-flat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="panel-title" style={{ margin: 0 }}><MessageSquare size={18} /> Чат сеанса</div>
                      <button className="neu-button" style={{ width: '32px', height: '32px' }} onClick={() => setIsChatOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="chat-messages">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
                      ))}
                    </div>
                    <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" className="neu-input neu-pressed" placeholder="Введите сообщение..." 
                             value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ flex: 1, padding: '10px 14px' }} />
                      <button type="submit" className="neu-button" style={{ padding: '0 16px', color: 'var(--accent-color)' }}><Send size={16} /></button>
                    </form>
                  </motion.div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="toast neu-flat">
              <CheckCircle2 size={16} color="var(--accent-color)" /> {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}