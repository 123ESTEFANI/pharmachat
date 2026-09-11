import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// La app de escritorio abre PharmaChat en línea: así las compañeras
// siempre tienen la última versión sin reinstalar nada.
const APP_URL = 'https://pharmachat.vercel.app';

const paginaSinConexion = () =>
  'data:text/html;charset=utf-8,' +
  encodeURIComponent(`<!doctype html><html lang="es"><head><meta charset="utf-8">
  <style>body{font-family:Segoe UI,Arial,sans-serif;background:#0f172a;color:#e2e8f0;
  display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
  .caja{max-width:420px;padding:32px}h1{color:#2dd4bf;font-size:22px}
  button{margin-top:18px;padding:10px 26px;border:0;border-radius:999px;background:#14b8a6;
  color:#fff;font-size:15px;cursor:pointer}</style></head>
  <body><div class="caja"><h1>💊 PharmaChat</h1>
  <p>No hay conexión a internet.<br>Revisa tu conexión y vuelve a intentar.</p>
  <button onclick="location.href='${APP_URL}'">Reintentar</button>
  </div></body></html>`);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 480,
    minHeight: 600,
    title: 'PharmaChat',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../public/icons/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Los enlaces externos (registros sanitarios, etc.) se abren en el navegador
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (evento, url) => {
    if (url.startsWith('http') && !url.startsWith(APP_URL)) {
      evento.preventDefault();
      shell.openExternal(url);
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
    return;
  }

  win.loadURL(APP_URL).catch(() => win.loadURL(paginaSinConexion()));
  win.webContents.on('did-fail-load', (_e, code) => {
    if (code !== -3) win.loadURL(paginaSinConexion());
  });
}

// Una sola instancia: si ya está abierta, enfoca la ventana existente
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
