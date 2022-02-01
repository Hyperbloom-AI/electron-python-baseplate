const { app, BrowserWindow, ipcMain, nativeTheme, nativeImage, NativeImage } = require('electron')
var { PythonShell } = require('python-shell');
const path = require('path')
const fs = require('fs')
const https = require('https')
const streamToBlob = require('stream-to-blob')


/*
    Creates a new window that will load index.html
*/

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New window',
        accelerator: 'Ctrl+N'
      },
      {
        label: 'Exit',
        accelerator: 'Alt+F4',
        role: 'quit'
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Help',
        accelerator: 'F1',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      },
      {
        label: 'About us',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
        },
    })

    /*ipcMain.on('window-minimize', function (event) {
      BrowserWindow.fromWebContents(event.sender).minimize();
    })
    
    ipcMain.on('window-maximize', function (event) {
      const window = BrowserWindow.fromWebContents(event.sender);
      window.isMaximized() ? window.unmaximize() : window.maximize();
    })
    
    ipcMain.on('window-close', function (event) {
      BrowserWindow.fromWebContents(event.sender).close()
    })
    
    ipcMain.on('window-is-maximized', function (event) {
      event.returnValue = BrowserWindow.fromWebContents(event.sender).isMaximized()
    })
    */

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

    ipcMain.handle('send-calculation:python', (input) => {

          let options = {
            mode: 'json',
            args: [input]
          };

          PythonShell.run('./py/calc.py', options, function (err, results) {

            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: ', results);
            var result = results[0];
            console.log(result)
          });
    })


    /*
    ipcMain.on('request-application-menu', function (event) {
      const menu = Menu.getApplicationMenu();
      const jsonMenu = JSON.parse(JSON.stringify(menu, parseMenu()));
      event.sender.send('titlebar-menu', jsonMenu);
    });
    
    ipcMain.on('menu-event', (event, commandId) => {
      const menu = Menu.getApplicationMenu();
      const item = getMenuItemByCommandId(commandId, menu);
      item?.click(undefined, BrowserWindow.fromWebContents(event.sender), event.sender);
    });
    
    // Parse menu to send it to the title bar
    const parseMenu = () => {
      const menu = new WeakSet();
      return (key, value) => {
        if (key === 'commandsMap') return;
        if (typeof value === 'object' && value !== null) {
          if (menu.has(value)) return;
          menu.add(value);
        }
        return value;
      };
    }
    
    // Gets the menu item on click
    const getMenuItemByCommandId = (commandId, menu = Menu.getApplicationMenu()) => {
      let menuItem;
      menu.items.forEach(item => {
        if (item.submenu) {
          const submenuItem = getMenuItemByCommandId(commandId, item.submenu);
          if (submenuItem) menuItem = submenuItem;
        }
        if (item.commandId === commandId) menuItem = item;
      });
    
      return menuItem;
    };

    */

    win.loadFile('index.html')
}

const iconName = path.join(__dirname, 'iconForDragAndDrop.png');
const icon = fs.createWriteStream(iconName);

// Create a new file to copy - you can also copy existing files.
fs.writeFileSync(path.join(__dirname, 'drag-and-drop-1.md'), '# First file to test drag and drop')
fs.writeFileSync(path.join(__dirname, 'drag-and-drop-2.md'), '# Second file to test drag and drop')

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
    event.sender.startDrag({
      file: path.join(__dirname, filePath),
      icon: iconName,
    })
  })

/*
    When Windows are closed on MacOS they remain open in background, this ensures our app will quit.
*/
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
