// preload.js
const { contextBridge, ipcRenderer } = require('electron')
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
      for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

contextBridge.exposeInMainWorld('electron', {
  startDrag: (fileName) => ipcRenderer.send('ondragstart', path.join(process.cwd(), fileName))
})

contextBridge.exposeInMainWorld('darkMode', {
    toggleDarkMode: () => ipcRenderer.invoke('dark-mode:toggle'),
    toggleLightMode: () => ipcRenderer.invoke('light-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('python', {
  sendCalculation: async (fileInput, config) => {
    return await ipcRenderer.invoke('send-calculation:python', fileInput, config)
  }
})