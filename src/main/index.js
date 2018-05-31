'use strict'

import { app, BrowserWindow, session, ipcMain, Menu, dialog } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import getMenuTemplate from '../menu'
import preferences from '../preferences'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let loginWindow
let videoStatus

function createMainWindow() {
  videoStatus = {
    isUploading: false,
    hasVideoInQueue: false
  }

  const window = new BrowserWindow({
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true
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

  window.on('close', (e) => {
    var alertSetting = preferences.value('notification.alert')
    if (alertSetting && alertSetting.includes('unuploaded') && videoStatus.isUploading) {
      let choice = dialog.showMessageBox(
        {
          type: 'question',
          buttons: ['是', '否'],
          title: '上传未完成',
          message: '上传未完成，确认退出？'
        }
      )
      if (choice === 1) {
        e.preventDefault()
        return
      }
    }

    if (alertSetting && alertSetting.includes('unsubmitted') && videoStatus.hasVideoInQueue) {
      let choice = dialog.showMessageBox(
        {
          type: 'question',
          buttons: ['是', '否'],
          title: '投稿未提交',
          message: '投稿未提交，确认退出？'
        }
      )
      if (choice === 1) {
        e.preventDefault()
        return
      }
    }
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })
  const menu = Menu.buildFromTemplate(getMenuTemplate(logOut, true))
  Menu.setApplicationMenu(menu)
  return window
}
// fake the headers to member.bilibili.com to fool the server
function fakeHeader() {
  const filters = {
    urls: [
      'https://member.bilibili.com/x/vu/web/cover/up',
      'https://member.bilibili.com/x/vu/web/add*'
    ]
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filters, (details, callback) => {
    details.requestHeaders['Origin'] = 'https://member.bilibili.com'
    details.requestHeaders['Referer'] = 'https://member.bilibili.com'
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
}

// logged in
ipcMain.on('loggedIn', (event, arg) => {
  // fakeHeader()
  mainWindow = createMainWindow()
})

ipcMain.on('isUploading', (event, arg) => {
  videoStatus.isUploading = arg
})

ipcMain.on('hasVideoInQueue', (event, arg) => {
  videoStatus.hasVideoInQueue = arg
})

function logOut() {
  session.defaultSession.clearStorageData(() => {
    mainWindow.close()
    // clearHeader()
    loginWindow = createLoginWindow()
  })

}

function login() {
  session.defaultSession.cookies.get({ domain: "bilibili.com", name: 'bili_jct' }, (error, cookies) => {
    if (cookies.length > 0) {
      // logged in
      mainWindow = createMainWindow()
    } else {
      // clearHeader()
      loginWindow = createLoginWindow()
    }
  })
}

function createLoginWindow() {
  const window = new BrowserWindow({
    width: 420,
    height: 400,
    titleBarStyle: 'hidden',
    useContentSize: true,
    webPreferences: {
      webSecurity: false
    }
  });
  window.on('closed', () => {
    loginWindow = null
  })
  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/#/login`)
    window.webContents.openDevTools()
  } else {
    window.webContents.openDevTools()
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      }) + '#/login'
    )
  }

  // menu, disable logout
  const menu = Menu.buildFromTemplate(getMenuTemplate(logOut, false))
  Menu.setApplicationMenu(menu)
  return window
}


// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  var isMinimizedWhenClosed = preferences.value('general.system').includes('minimize')
  if (!isMinimizedWhenClosed) {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow == null && loginWindow == null) {
    login()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  fakeHeader()
  login()
})
