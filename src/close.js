// const electron = require('electron')

const closebtn = document.getElementById('closebtn');

closebtn.addEventListener('click', function (event) {
    let remote = electron.remote;
    let win = remote.getCurrentWindow();
    win.close();
})

// const anotherWindowBtn = document.getElementById('anotherWindow');

// anotherWindowBtn.addEventListener('click', function (event) {
//     let remote = electron.remote;
//     let win = remote.getCurrentWindow();
//     win.close();
// })