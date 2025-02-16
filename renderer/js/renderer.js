const form = document.querySelector('#img-form');
const img = document.querySelector('#img');

const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');

const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const btn = document.querySelector('#btn');

btn.addEventListener('click', () => {
   console.log('Im working');
   electron.runPythonScript()
})

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);

// ---------------------------------------------------------------------------------------
// @ Image methods
// ---------------------------------------------------------------------------------------

// Validation : Make sure file is image
function isFileImage(file) {
   const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg'];
   return file && acceptedImageTypes.includes(file['type']);
}

// Load Image 
function loadImage(e) {
   const file = e.target.files[0];

   if (!isFileImage(file)) {
      alert('Please select an image', 'red')
      return;
   }

   alert('success', 'green');

   getOriginalDimensions(file);

   console.log(file)

   form.style.display = 'block';
   filename.innerText = file.name;
}

function getOriginalDimensions(file) {
   console.log('getOriginalDimensions()')

   const image = new Image();
   image.src = URL.createObjectURL(file);
   image.onload = function () {
      widthInput.value = this.width;
      heightInput.value = this.height;
   }

   filename.innerText = file.name;
   // outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

function sendImage(e) {
   e.preventDefault();

   const width = widthInput.value;
   const height = heightInput.value;

   // deprecated
   // const imgPath = img.files[0].path; 
   // console.log(img.files[0].path)
   const imgPath = electron.showFilePath(img.files[0])

   console.log('Path:')
   console.log(electron.showFilePath(img.files[0]))

   console.log(
      versions.node(),
      versions.chrome(),
      versions.electron()
   )
   
   if (!img.files[0]) {
      alert('Please upload an image', 'red');
   }

   if (width === '' || height == '') {
      alert('Pleas fill in a heigth and width');
   }

   // (Inter-Process Communication).
   // Send to main using ipcRenderer
   ipcRenderer.send('image:resize', {
      imgPath, 
      width,
      height
   })
}

ipcRenderer.on('image:done', () => {
   alert(`image resized to ${widthInput.value} x ${heightInput.value}`, 'green');
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