/**
 * Electron preload script — runs in renderer context with limited Node access.
 * Exposes a safe `window.electron` API to the Next.js page.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  /** Runtime info */
  isElectron: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome:   process.versions.chrome,
    node:     process.versions.node,
  },

  /** App metadata */
  getVersion: () => ipcRenderer.invoke("get-app-version"),

  /** Open a URL in the system browser */
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  /** Native message box */
  showMessageBox: (opts) => ipcRenderer.invoke("show-message-box", opts),

  /** Listen for navigate events sent from the main process */
  onNavigate: (callback) => {
    ipcRenderer.on("navigate", (_, path) => callback(path));
  },
});
