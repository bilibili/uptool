'use strict'

import { app, BrowserWindow, session, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import menuTemplate from '../menu'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow({
    webPreferences: {
      webSecurity: false
    }
  })

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    window.webContents.openDevTools()
  } else {
    window.webContents.openDevTools()
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    )
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}
// fake the headers to member.bilibili.com to fool the server
function fakeHeader() {
  const filters = {
    urls: ['*://*.bilibili.com']
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filters, (details, callback) => {
    details.requestHeaders['Origin'] = 'https://member.bilibili.com'
    details.requestHeaders['Referer'] = 'https://member.bilibili.com'
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
}

function clearHeader() {
  const filters = {
    urls: ['*://*.bilibili.com']
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filters, (details, callback) => {
    details.requestHeaders['Origin'] = ''
    details.requestHeaders['Referer'] = ''
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
}

// logged in
ipcMain.on('loggedIn', (event, arg) => {
  fakeHeader()
  mainWindow = createMainWindow()
})

function login() {
  session.defaultSession.cookies.get({domain: "bilibili.com", name: 'bili_jct'}, (error, cookies) => {
    if (cookies.length > 0) {
      // logged in
      mainWindow = createMainWindow()
    } else {
      const loginWindow = createLoginWindow()
    }
  })
}

function createLoginWindow() {
  const loginWindow = new BrowserWindow({
    width: 420,
    height: 400,
    titleBarStyle: 'hidden',
    useContentSize: true,
    webPreferences: {
      webSecurity: false
    }
  });
  if (isDevelopment) {
    loginWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/#/login`)
    loginWindow.webContents.openDevTools()
  } else {
    loginWindow.webContents.openDevTools()
    loginWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })  + '#/login'
    )
  }
  return loginWindow
}


// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  login()
  const { Menu } = require('electron')
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})
