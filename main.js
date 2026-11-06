const { app, BrowserWindow, ipcMain } = require('electron');

let sharedZoomFactor = 1.0;

function createWindow() {
  const window = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  // keep the main window zoom in sync with the renderer
  ipcMain.on('set-zoom-factor', (event, factor) => {
    if (typeof factor === 'number' && factor >= 0.5 && factor <= 2.0) {
      sharedZoomFactor = factor;
      window.webContents.setZoomFactor(sharedZoomFactor);
    }
  });

  // track zoom shortcut changes from the app menu
  window.webContents.on('zoom-changed', (event, zoomDirection) => {
    let current = window.webContents.getZoomFactor();
    if (zoomDirection === 'in') current = Math.min(Number((current + 0.1).toFixed(2)), 2.0);
    if (zoomDirection === 'out') current = Math.max(Number((current - 0.1).toFixed(2)), 0.5);
    sharedZoomFactor = current;
    window.webContents.setZoomFactor(sharedZoomFactor);
    window.webContents.send('zoom-factor-updated', sharedZoomFactor);
  });

  // reapply the same zoom on every page load
  window.webContents.on('did-finish-load', () => {
    window.webContents.setZoomFactor(sharedZoomFactor);
  });

  window.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
