const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const resizeImg = require('resize-img');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

const createMainWindow = () => {
   mainWindow = new BrowserWindow({
      title: 'Title Sample',
      width: isDev ? 1100 : 500,
      height: 600,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js'),
         sandbox: false,
      }
   })

   // Open dev tools if in dev env
   if (isDev) {
      mainWindow.webContents.openDevTools();
   }
  
   // mainWindow.loadFile(path.join(__dirname), './renderer/index.html');
   mainWindow.loadFile('renderer/index.html');

   // Respond to ipcRenderer url download
   ipcMain.on('url:download', (event, options) => {
      // console.log(options)
      options.dest = path.join(os.homedir(), 'youtube_downloaded_videos');
      downloadVideo(options);
   })

}

const creatAboutWindow = () => {
   const aboutWindow = new BrowserWindow({
      title: 'About ',
      width: 300,
      height: 300
   })
  
   // mainWindow.loadFile(path.join(__dirname), './renderer/index.html');
   aboutWindow.loadFile('renderer/about.html');
}

app.whenReady().then(() => {
   createMainWindow();

   // Implement menu
   const mainMenu = Menu.buildFromTemplate(menu);
   Menu.setApplicationMenu(mainMenu);

   // Remove main window from memory on close
   mainWindow.on('closed', () => mainWindow = null)

   app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
   })
});

const menu = [
   ...(isMac ? [{
      label: app.name,
      submenu: [
         {
            label: 'About',
         }
      ]
   }]: []),
   {
      role: 'fileMenu',
   },
   ...(!isMac ? [{
      label: 'Help',
      submenu: [
         {
            label: 'About',
            click: creatAboutWindow,
            accelerator: 'CmdorCtrl+H'
         }
      ]
   }] : []),
   {
      label: 'File',
      submenu: [
         {
            label: 'Quit',
            click: () => app.quit(),
            accelerator: 'CmdorCtrl+W'
         }
      ]
   }
]


// Cross platfrom stuff
app.on('window-all-closed', () => {
   if (!isMac) app.quit()
})


// win.loadURL('http://localhost:3000'); // O la URL de tu aplicación HTML

// ---------------------------------------------------------------------------------------
// @ Extra methods
// ---------------------------------------------------------------------------------------

function downloadVideo(options) {
   console.log(options)
   try {

      const pyScriptPath = path.join(__dirname, 'script.py');
      const url = encodeURIComponent(options.url); 

      const pythonProcess = spawn('python', [pyScriptPath, url]);

      pythonProcess.stdout.on('data', (data) => {
         console.log(`stdout: ${data}`);

         // / Convert the Buffer to a string
         const output = data.toString();
         
         console.log(`stdout: ${output}`);

         // Usamos una expresión regular para buscar el porcentaje de descarga
         const match = output.match(/\[download\]\s*([\d.]+)%/);
         if (match) {
            const percentage = match[1];
            console.log(`Progress: ${percentage}%`);

            // Send the percentage to the renderer process
            mainWindow.webContents.send('download:progress', percentage);
            // mainWindow.webContents.send('download:done', percentage);
         }
      });

      pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
      console.log(`El proceso Python terminó con el código ${code}`);
      });
      
      
      // console.log(url)
      // exec(`python "${pyScriptPath}" "${url}"`, (error, stdout, stderr) => {
      //    console.log('Ejecutando script...'); 

      //    if (error) {
      //       console.error(`Error on executing python script: ${error}`);
      //       return;
      //    }

      //    if (stdout) {
      //       console.log(`stdout: ${stdout}`);
      //    }

      //    if (stderr) {
      //       console.log(`stderr: ${stderr}`)
      //    }

      //    // // Verificamos si el script indicó que la descarga fue exitosa
      //    // if (stdout.includes('Download complete')) {
      //    //    // Notificamos que la descarga terminó correctamente
      //    //    event.reply('download-completed', 'El video se descargó correctamente');

      //    //    // Send success to render
      //    //    mainWindow.webContents.send('download:done');

      //    //    // Open dest folder
      //    //    // shell.openPath(dest)

      //    // } else {
      //    //    // Notificamos si hubo un error
      //    //    event.reply('download-failed', 'Hubo un problema con la descarga');
      //    // }
      // })

   } catch (error) {
      console.log('Error en el try-catch:', error);
   }
}