const $ = id => document.getElementById(id);
const fileInput = $('image');
const message = $('message');
const go = $('go');
const textInput = $('watermark-text');
const positionInput = $('position');
const colorInput = $('color');
const opacityInput = $('opacity');
const sizeInput = $('size');
const formatInput = $('format');
const resultBox = $('download-result');
const preview = $('preview');
const downloadLink = $('download');
const resultInfo = $('result-info');
const resultFormat = $('result-format');
let selectedFile = null;
let sourceImage = null;
let outputUrl = null;
let fileReadId = 0;
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
function createWatermarkedCanvas() {
  const width = sourceImage.naturalWidth;
  const height = sourceImage.naturalHeight;
  if (width > 12000 || height > 12000 || width * height > 20000000) {
    throw new Error('This image is too large to watermark reliably. Resize it first, then try again.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not prepare this image.');
  if (formatInput.value === 'image/jpeg') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(sourceImage, 0, 0);
  const watermark = textInput.value.trim();
  if (!watermark) return canvas;
  const fontSize = Math.max(12, Math.round(width * Number(sizeInput.value) / 100));
  const padding = Math.max(10, Math.round(Math.min(width, height) * 0.035));
  ctx.save();
  ctx.font = '700 ' + fontSize + 'px Arial, Helvetica, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const maxTextWidth = Math.max(1, width - padding * 2);
  let displayText = watermark;
  while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 1) {
    displayText = displayText.slice(0, -2) + '…';
  }
  const metrics = ctx.measureText(displayText);
  const textWidth = Math.min(metrics.width, maxTextWidth);
  const textHeight = fontSize * 1.25;
  const position = positionInput.value;
  let x = padding;
  let y = height - padding;
  if (position === 'bottom-left') { x = padding; y = height - padding; }
  if (position === 'bottom-right') { x = width - padding - textWidth; y = height - padding; }
  if (position === 'top-left') { x = padding; y = padding + textHeight / 2; }
  if (position === 'top-right') { x = width - padding - textWidth; y = padding + textHeight / 2; }
  if (position === 'center') { x = (width - textWidth) / 2; y = height / 2; }
  ctx.globalAlpha = Number(opacityInput.value) / 100;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = colorInput.value.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff';
  ctx.lineWidth = Math.max(2, fontSize * 0.08);
  ctx.strokeText(displayText, x, y, maxTextWidth);
  ctx.fillStyle = colorInput.value;
  ctx.fillText(displayText, x, y, maxTextWidth);
  ctx.restore();
  return canvas;
}
function canvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Could not export this image. Try another format.'));
      if (blob.type !== type) return reject(new Error('This browser does not support that output format.'));
      resolve(blob);
    }, type, 0.92);
  });
}
async function renderPreview() {
  if (!sourceImage) return;
  const current = ++renderId;
  clearResult();
  let canvas;
  try {
    canvas = createWatermarkedCanvas();
    const width = canvas.width;
    const height = canvas.height;
    const type = formatInput.value;
    const blob = await canvasToBlob(canvas, type);
    if (current !== renderId) return;
    outputUrl = URL.createObjectURL(blob);
    preview.src = outputUrl;
    downloadLink.href = outputUrl;
    const ext = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp';
    downloadLink.download = (selectedFile.name.replace(/\.[^.]+$/, '') || 'image') + '-watermarked.' + ext;
    resultInfo.textContent = width + ' × ' + height + ' px · ' + (blob.size / 1024).toFixed(1) + ' KB';
    resultFormat.textContent = ext.toUpperCase();
    resultBox.hidden = false;
    say('Preview updated. Download when you are happy with the result.');
  } catch (error) {
    if (current === renderId) say(error.message || 'Could not create the watermark preview.', true);
  } finally {
    if (canvas) { canvas.width = 1; canvas.height = 1; }
  }
}
function updateLabels() {
  $('opacity-value').textContent = opacityInput.value + '%';
  $('size-value').textContent = sizeInput.value + '%';
}
[textInput, positionInput, colorInput, opacityInput, sizeInput, formatInput].forEach(control => {
  control.addEventListener('input', () => { updateLabels(); if (sourceImage) renderPreview(); });
  control.addEventListener('change', () => { updateLabels(); if (sourceImage) renderPreview(); });
});
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
  const current = ++fileReadId;
  clearResult();
  selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  sourceImage = null;
  if (!selectedFile) { go.disabled = true; say('Select an image to get started.'); return; }
  if (!allowed.includes(selectedFile.type)) {
    selectedFile = null; fileInput.value = ''; go.disabled = true;
    say('Please choose a JPG, PNG, or WebP image.', true); return;
  }
  if (selectedFile.size > 20 * 1024 * 1024) {
    selectedFile = null; fileInput.value = ''; go.disabled = true;
    say('This image is over 20 MB. Choose a smaller file.', true); return;
  }
  fileInput.disabled = true; go.disabled = true; say('Reading image…');
  try {
    const image = await readImage(selectedFile);
    if (current !== fileReadId) return;
    if (image.naturalWidth > 12000 || image.naturalHeight > 12000 || image.naturalWidth * image.naturalHeight > 20000000) {
      throw new Error('This image is too large to watermark reliably. Resize it first, then try again.');
    }
    sourceImage = image;
    say(selectedFile.name + ' · ' + image.naturalWidth + ' × ' + image.naturalHeight + ' px · Ready to watermark.');
    await renderPreview();
    if (current === fileReadId) go.disabled = false;
  } catch (error) {
    if (current !== fileReadId) return;
    sourceImage = null; selectedFile = null; go.disabled = true;
    say(error.message || 'Could not read this image.', true);
  } finally {
    if (current === fileReadId) fileInput.disabled = false;
  }
});
go.addEventListener('click', () => {
  if (!sourceImage || !outputUrl) { say('Choose an image and wait for the preview first.', true); return; }
  downloadLink.click();
});
updateLabels();
window.addEventListener('beforeunload', clearResult);
