// preload.js
const { contextBridge, ipcRenderer } = require('electron')
const path = require('path');
const customTitlebar = require('custom-electron-titlebar')

window.addEventListener('DOMContentLoaded', () => {

    /*let MyTitleBar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#ffffff')
    });*/

    /*const titlebar = new customTitlebar.Titlebar({
      backgroundColor: customTitlebar.Color.fromHex("#eee"),
      onMinimize: () => ipcRenderer.send('window-minimize'),
      onMaximize: () => ipcRenderer.send('window-maximize'),
      onClose: () => ipcRenderer.send('window-close'),
      isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
      onMenuItemClick: (commandId) => ipcRenderer.send('menu-event', commandId)  // Add this for click action
    });*/

    ipcRenderer.send('request-application-menu');  // Add this for request menu

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
      for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

ipcRenderer.on('titlebar-menu', (event, menu) => {
  titlebar.updateMenu(menu)  // Add this for update menu
})

contextBridge.exposeInMainWorld('electron', {
  startDrag: (fileName) => {
    ipcRenderer.send('ondragstart', path.join(process.cwd(), fileName))
  }
})

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

contextBridge.exposeInMainWorld('darkMode', {
    toggleDarkMode: () => ipcRenderer.invoke('dark-mode:toggle'),
    toggleLightMode: () => ipcRenderer.invoke('light-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
})

/*send-calculation:python
dark-mode:system*/

contextBridge.exposeInMainWorld('python', {
    sendCalculation: () => ipcRenderer.invoke('send-calculation:python'),
})