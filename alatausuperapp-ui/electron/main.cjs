/**
 * Electron main process — Alatau City Government Desktop App
 * Wraps the Next.js government portal in a native window.
 *
 * Dev:  pnpm electron:dev   (starts Next.js + Electron together)
 * Prod: pnpm electron:build (builds Next.js then packages with electron-builder)
 */

const { app, BrowserWindow, shell, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const http = require("http");

const isDev = process.env.NODE_ENV === "development";
const NEXT_PORT = 3000;
const BASE_URL = `http://localhost:${NEXT_PORT}`;

let mainWindow = null;

// ── Wait for the Next.js dev server to be ready ───────────────────────────────

function waitForServer(retries = 40) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const req = http.get(`${BASE_URL}/government`, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });
      req.on("error", retry);
      req.setTimeout(1000, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      if (attempts++ >= retries) {
        reject(new Error("Next.js server did not start in time"));
      } else {
        setTimeout(check, 800);
      }
    };
    check();
  });
}

// ── Application menu ──────────────────────────────────────────────────────────

function buildMenu() {
  const nav = (path) => () => mainWindow?.loadURL(`${BASE_URL}${path}`);
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        }]
      : []),
    {
      label: "Navigate",
      submenu: [
        { label: "Dashboard",         accelerator: "CmdOrCtrl+1", click: nav("/government") },
        { label: "Analytics",         accelerator: "CmdOrCtrl+2", click: nav("/government/analytics") },
        { label: "Map",               accelerator: "CmdOrCtrl+3", click: nav("/government/map") },
        { label: "Projects",          accelerator: "CmdOrCtrl+4", click: nav("/government/projects") },
        { label: "Requests",          accelerator: "CmdOrCtrl+5", click: nav("/government/requests") },
        { label: "Reports",           accelerator: "CmdOrCtrl+6", click: nav("/government/reports") },
        { label: "Notifications",     accelerator: "CmdOrCtrl+7", click: nav("/government/notifications") },
        { label: "Voting / Polls",    accelerator: "CmdOrCtrl+8", click: nav("/government/polls") },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow?.reload(),
        },
        {
          label: "Toggle DevTools",
          accelerator: isMac ? "Alt+Cmd+I" : "Ctrl+Shift+I",
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac ? [{ type: "separator" }, { role: "front" }] : [{ role: "close" }]),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Create the main window ────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#F8FAFC",
    show: false,
    title: "Alatau City — Government Portal",
  });

  mainWindow.loadURL(`${BASE_URL}/government`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
  });

  // Keep external links in the browser, not inside Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(BASE_URL)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── IPC handlers ──────────────────────────────────────────────────────────────

ipcMain.handle("open-external", (_, url) => {
  shell.openExternal(url);
});

ipcMain.handle("show-message-box", (_, opts) => {
  return dialog.showMessageBox(mainWindow, opts);
});

ipcMain.handle("get-app-version", () => app.getVersion());

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  buildMenu();

  if (isDev) {
    console.log("[Electron] Waiting for Next.js on", BASE_URL, "…");
    try {
      await waitForServer();
      console.log("[Electron] Next.js ready — opening window");
    } catch (err) {
      console.error("[Electron]", err.message);
      app.quit();
      return;
    }
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
