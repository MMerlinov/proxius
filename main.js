import { app, BrowserWindow } from 'electron';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, 
    height: 800,
    minWidth: 1024, // Жесткая фиксация для небольших мониторов
    minHeight: 650,
    backgroundColor: '#080911',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#1a1a24', symbolColor: '#00d2ff' },
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  
  mainWindow.loadURL('http://localhost:5173'); 
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});