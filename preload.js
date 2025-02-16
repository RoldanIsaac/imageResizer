const { contextBridge, ipcRenderer, webUtils } = require('electron');
const os = require('os');
const path = require('node:path');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('electron', {
   runPythonScript: () => ipcRenderer.send('run-script-py'),
   onPythonScriptResult: (callback) => ipcRenderer.on('python-script-result', callback),
   showFilePath: (file) =>  {
      // It's best not to expose the full file path to the web content if
      // possible.
      const path = webUtils.getPathForFile(file);
      // alert(`Uploaded file path was: ${path}`);
      return path;
    }
   // showFilePath (file) {
   //    // It's best not to expose the full file path to the web content if
   //    // possible.
   //    const path = webUtils.getPathForFile(file)
   //    alert(`Uploaded file path was: ${path}`)
   //  }
});
contextBridge.exposeInMainWorld('os', {
   homedir: () => os.homedir(),
});

// contextBridge.exposeInMainWorld('path', {
//    join: (...args) => path.join(...args),
// })

contextBridge.exposeInMainWorld('Toastify', {
   toast: (options) => Toastify(options).showToast(),
})

contextBridge.exposeInMainWorld('ipcRenderer', {
   send: (channel, data) => ipcRenderer.send(channel, data),
   on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

contextBridge.exposeInMainWorld('versions', {
   node: () => process.versions.node,
   chrome: () => process.versions.chrome,
   electron: () => process.versions.electron
   // we can also expose variables, not just functions
 })