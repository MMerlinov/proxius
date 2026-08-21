import { app, BrowserWindow, ipcMain } from 'electron';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, 
    height: 800,
    minWidth: 1024,
    minHeight: 650,
    backgroundColor: '#080911',
    frame: false, // Отключаем стандартную рамку ОС полностью
    webPreferences: { 
      nodeIntegration: true, 
      contextIsolation: false 
    }
  });
  
  mainWindow.loadURL('http://localhost:5173'); 
  // mainWindow.webContents.openDevTools(); // Можешь раскомментировать для отладки

  // IPC слушатели для управления окном из React
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow.close());
}

app.whenReady().then(() => {
  createWindow();
});