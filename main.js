// some changes
const { app, BrowserWindow, Menu, MenuItem } = require('electron');
// const notifier = require('node-notifier');
const path = require("path");
const url = require("url");
// const menu = new Menu();
// menu.append(new MenuItem({ label: "aravind" }))
// Menu.setApplicationMenu(menu);

// Deep linked url
let deeplinkingUrl
let win
function createWindow() {
    win = new BrowserWindow({ height: 600, width: 400 });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'xendesk/index.html'),
        protocol: "file:",
        slashes: true
    })
    );

    // Open the DevTools.
    win.webContents.openDevTools()
    if (process.platform == 'win32') {
        // Keep only command line / deep linked arguments
        deeplinkingUrl = process.argv.slice(1)
    }
    logEverywhere("createWindow# " + deeplinkingUrl)
    // win.loadFile('xendesk/index.html');

    // notifier.notify({
    //     title: 'My awesome title',
    //     message: process.execPath,
    //     icon: path.join('', 'xendesk/assets/01.jpg'),  // Absolute path (doesn't work on balloons)
    //     sound: true,  // Only Notification Center or Windows Toasters
    //     wait: true

    // }, function (err, response) {
    //     // Response is response from notification
    // });
    // notifier.on('click', function (notifierObject, options) {
    //     console.log("You clicked on the notification")
    // });
}
app.setAppUserModelId(process.execPath);

app.setAsDefaultProtocolClient("xenvoice");

app.on('ready', createWindow);
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
// Protocol handler for osx
app.on('open-url', function (event, url) {
    event.preventDefault()
    deeplinkingUrl = url
    logEverywhere("open-url# " + deeplinkingUrl)
})

// Log both at dev console and at running node console instance
function logEverywhere(s) {
    console.log(s)
    if (win && win.webContents) {
        win.webContents.executeJavaScript(`console.log("${s}")`)
    }
}