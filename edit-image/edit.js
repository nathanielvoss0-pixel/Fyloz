const $ = id => document.getElementById(id);
const fileInput = $('image');
const message = $('message');
const go = $('go');
const formatInput = $('format');
const resultBox = $('download-result');
const preview = $('preview');
const downloadLink = $('download');
const resultInfo = $('result-info');
const resultFormat = $('result-format');
let selectedFile = null;
let sourceImage = null;
let outputUrl = null;
let angle = 0;
let flipX = 1;
let flipY = 1;
let renderId = 0;
const allowed = ['image/jpeg', 'image/png', 'image/webp'];

function say(text, error = false) {
  message.textContent = text;
  message.style.color = error ? '#a12c19' : '';
}
function clearResult() {
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  outputUrl = null;
  preview.removeAttribute('src');
  downloadLink.removeAttribute('href');
  resultBox.hidden = true;
}
function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('The browser could not open this image.')); };
    img.src = url;
  });
}
function getCanvas() {
  const swapped = Math.abs(angle) % 180 === 90;
  const width = sourceImage.naturalWidth;
  const height = sourceImage.naturalHeight;
  const outWidth = swapped ? height : width;
  const outHeight = swapped ? width : height;
  if (outWidth * outHeight > 20000000) throw new Error('This image is too large to edit reliably in the browser.');
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not prepare this image.');
  ctx.translate(outWidth / 2, outHeight / 2);
  ctx.rotate(angle * Math.PI / 180);
  ctx.scale(flipX, flipY);
  ctx.drawImage(sourceImage, -width / 2, -height / 2, width, height);
  return canvas;
}
function canvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Could not export the edited image. Try another format.'));
      if (blob.type !== type) return reject(new Error('This browser does not support that output format. Try JPG or PNG.'));
      resolve(blob);
    }, type, 0.92);
  });
}
async function renderPreview() {
  if (!sourceImage) return;
  const current = ++renderId;
  clearResult();
  try {
    const canvas = getCanvas();
    const type = formatInput.value;
    if (type === 'image/jpeg') {
      const ctx = canvas.getContext('2d');
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const white = document.createElement('canvas');
      white.width = canvas.width; white.height = canvas.height;
      const wctx = white.getContext('2d');
      wctx.fillStyle = '#fff'; wctx.fillRect(0, 0, white.width, white.height);
      wctx.putImageData(pixels, 0, 0);
      canvas.width = white.width; canvas.height = white.height;
      canvas.getContext('2d').drawImage(white, 0, 0);
    }
    const blob = await canvasToBlob(canvas, type);
    canvas.width = 1; canvas.height = 1;
    if (current !== renderId) return;
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = URL.createObjectURL(blob);
    preview.src = outputUrl;
    downloadLink.href = outputUrl;
    const ext = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp';
    downloadLink.download = (selectedFile.name.replace(/\.[^.]+$/, '') || 'image') + '-edited.' + ext;
    resultInfo.textContent = canvasDimensionsText(blob.size) + ' · original ' + sourceImage.naturalWidth + ' × ' + sourceImage.naturalHeight + ' px';
    resultFormat.textContent = ext.toUpperCase();
    resultBox.hidden = false;
    say('Preview updated. Download when you are happy with the result.');
  } catch (error) {
    say(error.message || 'Could not preview these edits.', true);
  }
}
function canvasDimensionsText(bytes) {
  return (bytes / 1024).toFixed(bytes < 10240 ? 2 : 1) + ' KB';
}
function changeTransform(change) {
  if (!sourceImage) { say('Choose an image first.', true); fileInput.focus(); return; }
  change();
  renderPreview();
}
$('rotate-left').addEventListener('click', () => changeTransform(() => { angle = (angle - 90 + 360) % 360; }));
$('rotate-right').addEventListener('click', () => changeTransform(() => { angle = (angle + 90) % 360; }));
$('flip-horizontal').addEventListener('click', () => changeTransform(() => { flipX *= -1; }));
$('flip-vertical').addEventListener('click', () => changeTransform(() => { flipY *= -1; }));
$('reset').addEventListener('click', () => changeTransform(() => { angle = 0; flipX = 1; flipY = 1; }));
formatInput.addEventListener('change', () => { if (sourceImage) renderPreview(); });
const dropArea = document.querySelector('.drop');
dropArea.addEventListener('dragover', event => { event.preventDefault(); if (!fileInput.disabled) dropArea.classList.add('drag-over'); });
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
dropArea.addEventListener('drop', event => {
  event.preventDefault(); dropArea.classList.remove('drag-over');
  if (fileInput.disabled) return;
  const file = event.dataTransfer && event.dataTransfer.files[0];
  if (!file) return;
  try {
    const transfer = new DataTransfer(); transfer.items.add(file);
    fileInput.files = transfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  } catch { say('Use the file picker to select your image.', true); }
});
fileInput.addEventListener('change', async () => {
  const current = ++renderId;
  clearResult();
  selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  sourceImage = null; angle = 0; flipX = 1; flipY = 1;
  if (!selectedFile) { go.disabled = true; say('Select an image to get started.'); return; }
  if (!allowed.includes(selectedFile.type)) {
    selectedFile = null; fileInput.value = ''; go.disabled = true;
    say('Please choose a JPG, PNG, or WebP image.', true); return;
  }
  if (selectedFile.size > 20 * 1024 * 1024) {
    selectedFile = null; fileInput.value = ''; go.disabled = true;
    say('This image is over 20 MB. Choose a smaller file.', true); return;
  }
  go.disabled = true; say('Reading image…');
  try {
    const image = await readImage(selectedFile);
    if (current !== renderId) return;
    if (image.naturalWidth * image.naturalHeight > 20000000) {
      throw new Error('This image has more than 20 million pixels. Resize it first, then edit the smaller copy.');
    }
    sourceImage = image;
    go.disabled = false;
    say(selectedFile.name + ' · ' + image.naturalWidth + ' × ' + image.naturalHeight + ' px · Ready to edit.');
    await renderPreview();
  } catch (error) {
    if (current !== renderId) return;
    sourceImage = null; selectedFile = null; go.disabled = true;
    say(error.message || 'Could not read this image.', true);
  }
});
go.addEventListener('click', () => {
  if (!sourceImage || !outputUrl) { say('Choose an image and wait for the preview first.', true); return; }
  downloadLink.click();
});
window.addEventListener('beforeunload', clearResult);
