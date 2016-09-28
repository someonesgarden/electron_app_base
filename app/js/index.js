const electron  = require('electron');
const remote    = electron.remote;
const dialog    = remote.require('electron').dialog;
const osxPrefs  = require('electron-osx-appearance');
const marked    = require('marked');
const fs        = require('fs');

const shell         = electron.shell;
const ipcRenderer   = electron.ipcRenderer;
const clipboard     = electron.clipboard;
const container     = document.querySelector('.container');
const editor        = document.querySelector('.editor textarea');
const preview       = document.querySelector('.preview');
const openFileLink          = document.querySelector('a.open-file');
const saveFileLink          = document.querySelector('a.save-file');
const showFileInFolderLink  = document.querySelector('a.show-file-in-folder');
const openDLLink            = document.querySelector('a.open-download');
const topLogo               = document.querySelector('img.toplogo');
remote.app.clearRecentDocuments();

///////////////////
const platform = require('./platform');
document.body.classList.add('platform-' + platform.name);

if(platform.isMac){
    if(osxPrefs.isDarkMode()){
        document.body.classList.add('platform-'+platform.name + '--dark');
    }
    osxPrefs.onDarkModeChanged(function(){
        console.log("onDarkModeChanged");
    });
}
//////////////////
var forEach = function(selector, callback){
    return [].forEach.call(document.querySelectorAll(selector), callback);
};

var actions = ['minimize', 'maximize', 'restore', 'close'];

forEach('.window-action', function(windowAction){
    windowAction.onclick = function(e){
        actions.forEach(function(actionName){
            var classNameSegment = actionName;
            if(windowAction.classList.contains('window-action-' + classNameSegment)){
                ipcRenderer.send('main-window', classNameSegment);
            }
        });
    };
});


ipcRenderer.on('maximized', function(){
    document.body.classList.add('window--is-maximised');
    document.querySelector('.window-action-wrapper-maximize').style.display = 'none';
    document.querySelector('.window-action-wrapper-restore').style.display = 'inherit';
});

ipcRenderer.on('restored', function(){
    document.body.classList.remove('window--is-maximised');
    document.querySelector('.window-action-wrapper-maximize').style.display = 'inherit';
    document.querySelector('.window-action-wrapper-restore').style.display = 'none';
});

//////////////////

var currentFile = remote.getGlobal('fileToOpen') || null;
if(currentFile) {
    openFile(currentFile);
}

ipcRenderer.on('open-file', function(event, arg){
    openFile(arg);
});

marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

editor.onkeyup = generatePreview;

openDLLink.onclick = function(evt){
    console.log("Open Download click!");
    var downloads       = remote.app.getPath('downloads');
    shell.openItem(downloads);
}

topLogo.onclick = function(evt){
    var notification = new Notification("Welcome to Someonesgarden.org", {
        body:'[Click] to open website.',
        icon:'img/logo.png'
    });
    notification.onclick = function(){
        shell.openExternal('http://www.someonesgarden.org');
    }
}

openFileLink.onclick = function(evt){
    dialog.showOpenDialog({
        title: 'Select a file to edit',
        //defaultPath:'~/',
        filters: [
            { name: 'Markdown Documents', extensions: ['md', 'markdown'] }
        ]
    }, function(filenames){
        if (!filenames) return;
        if (filenames.length > 0) {
            openFile(filenames[0]);
            saveFileLink.classList.remove('hidden');
        }
    })
};

showFileInFolderLink.onclick = function(evt){
    shell.showItemInFolder(currentFile);
};


saveFileLink.onclick = function(evt){
    dialog.showOpenDialog({
        title: 'Select a place to save',
        properties: ['openDirectory']
    }, function(dirnames){
        if (!dirnames) return;
        if (dirnames.length > 0) {
            console.log(currentFile);
            var contents = editor.value;
            //var contents = clipboard.readText('selection');
            saveFile (dirnames[0], contents);
        }
    })
};


function generatePreview () {
    var content = editor.value;
    var html = marked(content);
    preview.innerHTML = html;

    if(editor.value.length >0){
        saveFileLink.classList.remove('hidden');
    }
}

function openFile (filename) {

    document.title =filename;

    var contents = fs.readFileSync(filename);
    currentFile  = filename;
    editor.value = contents;

    container.classList.remove('hidden');
    remote.app.addRecentDocument(filename);

    generatePreview();

    ipcRenderer.send('set-represented-filename',filename);
}

function saveFile (dirname, content){
    console.log(dirname);
    //var filename = dirname+'/README'+new Date().getTime()+'.md';
    var filename = dirname+'/README.md';
    fs.writeFile(filename, content, function(err){
        if (err) throw err;
        console.log('It\'s saved!');
    });
}
