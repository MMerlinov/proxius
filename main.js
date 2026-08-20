import { app, BrowserWindow } from 'electron';
import { Server } from 'socket.io';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    backgroundColor: '#121212',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#1a1a24', symbolColor: '#00d2ff' },
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  
  // Vite запускает dev-сервер на порту 5173
  mainWindow.loadURL('http://localhost:5173'); 
}

app.whenReady().then(() => {
  createWindow();
  
  const io = new Server(3000, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('Устройство подключено:', socket.id);
  });
});