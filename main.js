const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
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

   // runPythonScript();

   ipcMain.on('run-script-py', (event) => {
      runPythonScript(event)
   })

   // Respond to ipcRenderer rezise
   ipcMain.on('image:resize', (e, options) => {
      options.dest = path.join(os.homedir(), 'imageresizer');
      resizeImage(options);
      console.log(options)
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

async function resizeImage({ imgPath, width, height, dest }) {
   try {
      const newPath = await resizeImg(fs.readFileSync(imgPath), {
         width: +width,
         height: +height,
      })  

      const filename = path.basename(imgPath);

      // Create dest folder
      if (!fs.existsSync(dest)) {
         fs.mkdirSync(dest)
      }

      console.log(1)

      // write file to destination folder
      fs.writeFileSync(path.join(dest, filename), newPath); 

      // Send success to render
      mainWindow.webContents.send('image:done');

      // Open dest folder
      shell.openPath(dest)
      
   } catch (error) {
      console.log(2)
      console.log(error);
   }
}

function runPythonScript(event) {
   const pyScriptPath = path.join(__dirname, 'script.py');

   exec(`python "${pyScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
         console.error(`Error al ejecutar el script de python: ${error}`);
         return;
      }

      if (stderr) {
         console.log(`stderr: ${stderr}`)
      }

      console.log(`stdout: ${stdout}`)
      event.reply('pyhton-script-result', stdout);
   })
}