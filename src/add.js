const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

const notifyBtn = document.getElementById('btn')

notifyBtn.addEventListener('click', function (event) {
    console.log(event);
    const modalPath = path.join('file://', __dirname, 'add.html')
    let win = new BrowserWindow({ width: 300, height: 300, x: 1050, y: 400, frame: false, backgroundColor: '#0288d1' })
    win.on('close', function () { win = null })
    win.loadURL(modalPath);
    win.show()
})
