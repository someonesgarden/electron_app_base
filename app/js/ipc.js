window.ipcRenderer.on('pong', function(event,arg){
   document.write('<h1>POIONG!!:'+arg+'</h1>');
});

window.ipcRenderer.send('ping','hello');
