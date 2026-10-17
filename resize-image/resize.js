const $ = id => document.getElementById(id);
const localize = text => window.FylozI18n ? window.FylozI18n.translate(text) : text;
const fileInput = $('image');
const message = $('message');
const go = $('go');
const widthInput = $('width');
const heightInput = $('height');
const keepRatio = $('keep-ratio');
const formatInput = $('format');
const resultBox = $('download-result');
const preview = $('preview');
const downloadLink = $('download');
const resultInfo = $('result-info');
const resultFormat = $('result-format');
let selectedFile = null;
let sourceImage = null;
let outputUrl = null;
let sourceRatio = 1;
let imageReadId = 0;

const dropArea = document.querySelector('.drop');
dropArea.addEventListener('dragover', event => {
  event.preventDefault();
  if (!fileInput.disabled) dropArea.classList.add('drag-over');
});
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
dropArea.addEventListener('drop', event => {
  event.preventDefault();
  dropArea.classList.remove('drag-over');
  if (fileInput.disabled) return;
  const file = event.dataTransfer && event.dataTransfer.files[0];
  if (!file) return;
  try {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  } catch {
    say('Use the file picker to select your image.', true);
  }
});
function say(text, error = false) {
  message.textContent = localize(text);
  message.style.color = error ? '#a12c19' : '';
}
function clearResult() {
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  outputUrl = null;
  preview.removeAttribute('src');
  downloadLink.removeAttribute('href');
  resultBox.hidden = true;
}
function revokeOutput() {
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  outputUrl = null;
}
function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The browser could not open this image. Try another file.'));
    };
    img.src = url;
  });
}
function updateOtherDimension(changed) {
  if (!sourceImage || !keepRatio.checked) return;
  if (changed === 'width' && widthInput.value) {
    heightInput.value = Math.max(1, Math.round(Number(widthInput.value) / sourceRatio));
  } else if (changed === 'height' && heightInput.value) {
    widthInput.value = Math.max(1, Math.round(Number(heightInput.value) * sourceRatio));
  }
}
widthInput.addEventListener('input', () => updateOtherDimension('width'));
heightInput.addEventListener('input', () => updateOtherDimension('height'));
keepRatio.addEventListener('change', () => {
  if (keepRatio.checked) updateOtherDimension('width');
});

fileInput.addEventListener('change', async () => {
  const currentReadId = ++imageReadId;
  clearResult();
  selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  sourceImage = null;
  if (!selectedFile) { say('Select an image to get started.'); return; }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
    selectedFile = null;
    fileInput.value = '';
    say('Please choose a JPG, PNG, or WebP image.', true);
    return;
  }
  if (selectedFile.size > 20 * 1024 * 1024) {
    selectedFile = null;
    fileInput.value = '';
    say('This image is over 20 MB. Choose a smaller file.', true);
    return;
  }
  go.disabled = true;
  say('Reading image dimensions…');
  try {
    const image = await readImage(selectedFile);
    if (currentReadId !== imageReadId) return;
    sourceImage = image;
    sourceRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
    widthInput.value = sourceImage.naturalWidth;
    heightInput.value = sourceImage.naturalHeight;
    say(selectedFile.name + ' · ' + sourceImage.naturalWidth + ' × ' + sourceImage.naturalHeight + ' px · Ready to resize.');
  } catch (error) {
    if (currentReadId !== imageReadId) return;
    selectedFile = null;
    sourceImage = null;
    say(error.message || 'Could not read this image.', true);
  } finally {
    if (currentReadId === imageReadId) go.disabled = false;
  }
});

function canvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Your browser could not export this image in that format. Try another format.'));
    }, type, 0.92);
  });
}

go.addEventListener('click', async () => {
  if (!selectedFile || !sourceImage) {
    say('Choose an image first.', true);
    fileInput.focus();
    return;
  }
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 12000 || height > 12000) {
    say('Enter a width and height from 1 to 12,000 pixels.', true);
    widthInput.focus();
    return;
  }
  if (width * height > 20000000) {
    say('That size is too large for a reliable browser export. Choose dimensions with no more than 20 million pixels.', true);
    return;
  }

  clearResult();
  fileInput.disabled = true;
  go.disabled = true;
  go.textContent = localize('Resizing image…');
  say('Resizing in your browser. Keep this tab open…');
  try {
    // Give the browser a chance to paint the loading message before canvas work.
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser does not support image resizing on this page.');
    const type = formatInput.value;
    if (type === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(sourceImage, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, type);
    canvas.width = 1;
    canvas.height = 1;
    revokeOutput();
    outputUrl = URL.createObjectURL(blob);
    preview.src = outputUrl;
    downloadLink.href = outputUrl;
    const extension = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp';
    downloadLink.download = (selectedFile.name.replace(/\.[^.]+$/, '') || 'image') + '-resized.' + extension;
    resultInfo.textContent = localize(sourceImage.naturalWidth + ' × ' + sourceImage.naturalHeight + ' px → ' + width + ' × ' + height + ' px · ' + (blob.size / 1024).toFixed(1) + ' KB');
    resultFormat.textContent = extension.toUpperCase();
    resultBox.hidden = false;
    say('Done — your resized image is ready to download.');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    say(error.message || 'Something went wrong. Please try another image.', true);
  } finally {
    fileInput.disabled = false;
    go.disabled = false;
    go.innerHTML = localize('Resize image') + ' <span aria-hidden="true">↗</span>';
  }
});

window.addEventListener('beforeunload', clearResult);
