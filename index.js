// @ts-nocheck
// This file isnt used in the game itself, but for starting the game in an Electron wrapper
// when installed in for example Lutris or via the AUR.

// eslint-disable-next-line no-undef
const {app, BrowserWindow} = require('electron')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1320,
    height: 990,
    autoHideMenuBar: true
  })

  mainWindow.setMenu(null)
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  app.quit()
})