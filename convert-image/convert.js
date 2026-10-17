const $ = id => document.getElementById(id);
const localize = text => window.FylozI18n ? window.FylozI18n.translate(text) : text;
const fileInput = $('image');
const message = $('message');
const go = $('go');
const formatInput = $('format');
const qualityInput = $('quality');
const qualityValue = $('quality-value');
const qualityWrap = $('quality-wrap');
const resultBox = $('download-result');
const preview = $('preview');
const downloadLink = $('download');
const resultInfo = $('result-info');
const resultFormat = $('result-format');
let selectedFile = null;
let outputUrl = null;
let imageReadId = 0;
const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

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
function formatKB(bytes) {
  return (bytes / 1024).toFixed(bytes < 10240 ? 2 : 1) + ' KB';
}
function updateQualityControl() {
  const lossy = formatInput.value !== 'image/png';
  qualityWrap.hidden = !lossy;
  qualityInput.disabled = !lossy;
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
qualityInput.addEventListener('input', () => {
  qualityValue.textContent = qualityInput.value + '%';
});
formatInput.addEventListener('change', updateQualityControl);
fileInput.addEventListener('change', async () => {
  const currentReadId = ++imageReadId;
  clearResult();
  selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  if (!selectedFile) { say('Select an image to get started.'); return; }
  if (!supportedTypes.includes(selectedFile.type)) {
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
  say('Checking image…');
  try {
    const img = await readImage(selectedFile);
    if (currentReadId !== imageReadId) return;
    say(selectedFile.name + ' · ' + img.naturalWidth + ' × ' + img.naturalHeight + ' px · Ready to convert.');
  } catch (error) {
    if (currentReadId !== imageReadId) return;
    selectedFile = null;
    say(error.message || 'Could not read this image.', true);
  } finally {
    if (currentReadId === imageReadId) go.disabled = false;
  }
});
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('This browser could not export that format. Try another output format.'));
        return;
      }
      // Some browsers may silently fall back to PNG for an unsupported encoder.
      if (blob.type !== type) {
        reject(new Error('Your browser did not support that output format. Try JPG or PNG instead.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}
go.addEventListener('click', async () => {
  if (!selectedFile) {
    say('Choose an image first.', true);
    fileInput.focus();
    return;
  }
  const fileAtStart = selectedFile;
  const type = formatInput.value;
  const quality = Number(qualityInput.value) / 100;
  clearResult();
  fileInput.disabled = true;
  go.disabled = true;
  go.textContent = localize('Converting image…');
  say('Converting in your browser. Keep this tab open…');
  let canvas;
  try {
    const img = await readImage(fileAtStart);
    const maxPixels = 20000000;
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (width * height > maxPixels) {
      const scale = Math.sqrt(maxPixels / (width * height));
      width = Math.max(1, Math.floor(width * scale));
      height = Math.max(1, Math.floor(height * scale));
    }
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image.');
    if (type === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(img, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, type, quality);
    canvas.width = 1;
    canvas.height = 1;
    const extension = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp';
    outputUrl = URL.createObjectURL(blob);
    preview.src = outputUrl;
    downloadLink.href = outputUrl;
    downloadLink.download = (fileAtStart.name.replace(/\.[^.]+$/, '') || 'image') + '-fyloz.' + extension;
    resultInfo.textContent = localize(formatKB(fileAtStart.size) + ' original → ' + formatKB(blob.size) +
      ' converted · ' + width + ' × ' + height + ' px · ' + extension.toUpperCase());
    resultFormat.textContent = extension.toUpperCase();
    resultBox.hidden = false;
    say('Done — your ' + extension.toUpperCase() + ' image is ready to download.');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    say(error.message || 'Something went wrong. Please try another image.', true);
  } finally {
    if (canvas) { canvas.width = 1; canvas.height = 1; }
    fileInput.disabled = false;
    go.disabled = false;
    go.innerHTML = localize('Convert image') + ' <span aria-hidden="true">↗</span>';
  }
});
updateQualityControl();
window.addEventListener('beforeunload', clearResult);
