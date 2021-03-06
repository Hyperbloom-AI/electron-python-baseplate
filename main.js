const { app, BrowserWindow, ipcMain, nativeTheme, nativeImage, NativeImage } = require('electron')
var { PythonShell } = require('python-shell');
const path = require('path')
const fs = require('fs')
const https = require('https')

require('update-electron-app')()

/*
    Creates a new window that will load index.html
*/

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: 'logo_type-2.ico', // sets window icon
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        },
    })

    ipcMain.handle('dark-mode:toggle', () => {
        nativeTheme.themeSource = 'dark'
        return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('light-mode:toggle', () => {
        nativeTheme.themeSource = 'light'
        return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system'
        return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('send-calculation:python', async (event, fileInput, config) => {
      let options = {
        mode: 'text',
        args: [fileInput, config]
      };
    
      const result = await new Promise((resolve, reject) => {
        PythonShell.run(path.join(__dirname, 'py/translator.py'), options, async (err, results) => {
          if (err) {
            reject(err);
          }
          resolve(results[0])
        })
      })
    
      return result;
    
    })

    win.loadFile('index.html')
}

async function savePath(r) {
  return r
}

const iconName = path.join(__dirname, 'iconForDragAndDrop.png');
const icon = fs.createWriteStream(iconName);

https.get('https://img.icons8.com/ios/452/drag-and-drop.png', (response) => {
  response.pipe(icon);
});

/*
    MacOS continues to be generally annoying needing a new window declared when none are open
*/
app.whenReady().then(() => {

    /*
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    */

    createWindow()
  
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  ipcMain.on('ondragstart', (event, filePath) => {
    console.log(filePath)
    event.sender.startDrag({
      file: filePath,
      icon: iconName,
    })
  })

/*
    When Windows are closed on MacOS they remain open in background, this ensures our app will quit.
*/
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
