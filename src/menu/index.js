const { app, session } = require('electron')
import preferences from '../preferences'
function getMenuTemplate(logOut, isLogOutEnabled) {
    var template = [
        {
            label: app.getName(),
            submenu: [
                {
                    label: 'Preferences',
                    click() {
                        preferences.show()
                    },
                    accelerator: 'CmdOrCtrl+,'
                },
                { type: 'separator' },
                {
                    label: 'Log Out',
                    click: () => { logOut() },
                    enabled: isLogOutEnabled
                },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() { require('electron').shell.openExternal('https://electronjs.org') }
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        template[0].unshift({ role: 'about' }, { type: 'separator' })
        template[0].slice(2, { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' })
        // Edit menu
        template[1].submenu.push(
            { type: 'separator' },
            {
                label: 'Speech',
                submenu: [
                    { role: 'startspeaking' },
                    { role: 'stopspeaking' }
                ]
            }
        )

        // Window menu
        template[3].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ]
    }
    return template
}

export default getMenuTemplate