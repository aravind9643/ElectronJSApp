const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

const anotherWindowBtn = document.getElementById('anotherWindow')

anotherWindowBtn.addEventListener('click', function (event) {
    // console.log(event);
    const modalPath = path.join('file://', __dirname, 'call.html')
    let win = new BrowserWindow({ width: 800, height: 600 })
    win.on('close', function () { win = null })
    win.loadURL(modalPath);
    win.show()
    let remote = electron.remote;
    let cwin = remote.getCurrentWindow();
    cwin.close();
})