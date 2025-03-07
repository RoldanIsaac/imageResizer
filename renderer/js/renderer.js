const form = document.querySelector('#yt-form');
const urlInput = document.querySelector('#url');
const outputPath = document.querySelector('#output-path');
const btn = document.querySelector('#btn');

// btn.addEventListener('click', () => {
//    const url = urlInput.value;
//    console.log(url)
//    electron.runPythonScript(url)
// });

form.addEventListener('submit', sendUrl);

// ---------------------------------------------------------------------------------------
// @ Public methods
// ---------------------------------------------------------------------------------------

function sendUrl(e) {
   e.preventDefault();
   const url = urlInput.value;
   console.log(url)
   // (Inter-Process Communication).
   // Send to main using ipcRenderer
   ipcRenderer.send('url:download', {
      url,
   })
}

ipcRenderer.on('download:done', () => {
   alert(`Video downloaded successfully! Seize time!`, 'green');
})

ipcRenderer.on('download:progress', (percentage) => {
   console.log(percentage);
   document.getElementById('progressText').innerText = `${percentage}%`;
   document.getElementById('bar').style.width = `${percentage}%`;
})

// ---------------------------------------------------------------------------------------
// @ Alert
// ---------------------------------------------------------------------------------------

function alert(message, color) {
   Toastify.toast({
      text: message, 
      duration: 1500,
      close: false,
      style: {
         background: color,
         color: 'white',
         textAlign: 'center'
      }
   })
}































