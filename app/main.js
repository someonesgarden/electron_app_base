const electron      = require('electron');
const globalShortcut= electron.globalShortcut;
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const menu          = electron.Menu;
const ipcMain       = electron.ipcMain;
const dialog        = electron.dialog;
const Tray          = electron.Tray;
var trayIcon = null;
var AutoLaunch      = require('auto-launch');

////
var homeDirectory   = app.getPath('home');
var appData         = app.getPath('appData');
var temp            = app.getPath('temp');
var desktop         = app.getPath('desktop');
var documents       = app.getPath('documents');
var downloads       = app.getPath('downloads');
var music           = app.getPath('music');
var pictures        = app.getPath('pictures');
var videos          = app.getPath('videos');
var exe             = app.getPath('exe');
console.log(homeDirectory);
console.log(appData);
console.log(temp);
console.log(desktop);
console.log(documents);
console.log(downloads);
console.log(music);
console.log(pictures);
console.log(videos);
console.log(exe);
if(app.getName()!== 'Electron' && process.argv.length > 1){
    filePath = process.argv[1];
    console.log("filePath:"+filePath);
}

/////
var mainWindow      = null;
global.fileToOpen   = null;

ipcMain.on('set-represented-filename',
function(event,filename){
   mainWindow.setRepresentedFilename(filename);
});

ipcMain.on('main-window',function(event, windowActionName){
    console.log("windowAdction:"+windowActionName);
    if(windowActionName === 'restore'){
        mainWindow.unmaximize();
    }else{
        mainWindow[windowActionName]();
    }
});

app.on('open-file', function(event, path){
    event.preventDefault();
    fileToOpen = path;
    if(mainWindow){
        mainWindow.send('open-file', path);
    }
});


/////////////////////// APP
/*
app.on('window-all-closed', function () {});
app.on('activate', function(){});
app.on('before-quit', function(evt){});
app.on('quit', function(evt, exitCode){});
app.on('uncaughtException', function(err) {});
*/

app.on('ready', function() {

    ///Tray
    trayIcon = new Tray('img/logo.png');

    //// Dialog
    var dialog_obj={
        title   : "title",
        detail  : "This is test electron application for editing README.md",
        message : "README.md Editor by someonesgarden",
        icon    : "img/logo.png",
        buttons :['Enter', 'Quit','License']
    };

    var dialog_callback=function(indexOfButton){
        if(indexOfButton===0){
            console.log("ENTER was clicked");
        }
        else if(indexOfButton===1){
            console.log("QUIT was clicked");
            app.quit();
        }else{
            console.log("LICENSE was clicked");
        }
    };

    //dialog.showMessageBox(dialog_obj, dialog_callback);


    //KEY SHORTCUTS
    var isRegistered = globalShortcut.register('Ctrl+V', function(){
       console.log("Ctrl+V is pressed");
    });

    if(!isRegistered){
        console.log("NOT Registered");
    }
    //globalShortcut.unregisterAll(); //Unregister ALL

    //MAIN WINDOW
    mainWindow = new BrowserWindow(
        {
            title: "ReadmeEditor",
            width:800, height:600,
            //transparent: true,
            webPreferences:
            {
                //nodeIntegration:false,
                preload: __dirname + '/preload.js'
            },
            frame:false
            //titleBarStyle:'hidden'

        });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function() { mainWindow = null });

    mainWindow.on('maximize', function(){
        mainWindow.webContents.send('maximized');
    });
    mainWindow.on('unmaximize', function(){
        mainWindow.webContents.send('restored');
    });

    //mainWindow.webContents.openDevTools();
    //mainWindow.setDocumentEdited(true);
    mainWindow.setProgressBar(0.5);
    mainWindow.showDefinitionForSelection();
    app.dock.setBadge('4');

    //MENU
    const template = [
        {
            label: 'app-name',
            submenu: [
                {
                    label: '終了',
                    accelerator: 'Command+Q',
                    click: function() { app.quit(); }
                }
            ]
        },
        {
            label: 'File',
            submenu: [
                {type: 'separator'},
                {
                    label: '保存',
                    accelerator:'Command+S',
                    click: function(){myaction('save');}}
            ]
        },
    ];
    const menu_ = menu.buildFromTemplate(template)
    menu.setApplicationMenu(menu_);
});

/////// FUNC
function myaction(action){
    console.log(action);
}