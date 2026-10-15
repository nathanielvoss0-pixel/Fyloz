const $ = id => document.getElementById(id);
const fileInput = $('image');
const message = $('message');
const go = $('go');
const limitInput = $('limit');
const resultBox = $('download-result');
const preview = $('preview');
const downloadLink = $('download');
const resultInfo = $('result-info');
const savingsLabel = $('savings');
let selectedFile = null;
let outputUrl = null;

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
function formatKB(bytes) {
  return (bytes / 1024).toFixed(bytes < 10 * 1024 ? 2 : 1) + ' KB';
}
function setLimit(value) {
  limitInput.value = value;
  document.querySelectorAll('[data-kb]').forEach(button => {
    const active = Number(button.dataset.kb) === Number(value);
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
document.querySelectorAll('[data-kb]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
  button.addEventListener('click', () => setLimit(button.dataset.kb));
});
limitInput.addEventListener('input', () => {
  document.querySelectorAll('[data-kb]').forEach(button => {
    const active = Number(button.dataset.kb) === Number(limitInput.value);
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
});

fileInput.addEventListener('change', () => {
  clearResult();
  selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
  if (!selectedFile) {
    say('Select an image to get started.');
    return;
  }
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
  say(selectedFile.name + ' · ' + formatKB(selectedFile.size) + ' · Ready to prepare.');
});

function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The browser could not open this image. Try another file.'));
    };
    img.src = url;
  });
}
function encodeJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Your browser could not create the compressed image.'));
    }, 'image/jpeg', quality);
  });
}
async function bestQualityAtSize(canvas, targetBytes) {
  let low = 0.05;
  let high = 0.95;
  let best = null;
  for (let i = 0; i < 12; i++) {
    const quality = (low + high) / 2;
    const blob = await encodeJpeg(canvas, quality);
    if (blob.size <= targetBytes) {
      best = blob;
      low = quality;
    } else {
      high = quality;
    }
  }
  return best;
}
async function compressToLimit(img, targetBytes) {
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  // Limit extreme canvas sizes so a very large photo does not exhaust browser memory.
  const maxPixels = 20000000;
  if (width * height > maxPixels) {
    const scale = Math.sqrt(maxPixels / (width * height));
    width = Math.max(1, Math.floor(width * scale));
    height = Math.max(1, Math.floor(height * scale));
  }

  for (let pass = 0; pass < 18; pass++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image.');
    // JPEG has no transparency; fill transparent source areas with white.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(img, 0, 0, width, height);

    const blob = await bestQualityAtSize(canvas, targetBytes);
    canvas.width = 1;
    canvas.height = 1;
    if (blob && blob.size <= targetBytes) return { blob, width, height };

    if (width === 1 && height === 1) break;
    width = Math.max(1, Math.floor(width * 0.82));
    height = Math.max(1, Math.floor(height * 0.82));
  }
  throw new Error('This target is too small to reach reliably. Try a larger KB limit.');
}

go.addEventListener('click', async () => {
  if (!selectedFile) {
    say('Choose an image first.', true);
    fileInput.focus();
    return;
  }
  const kb = Number(limitInput.value);
  if (!Number.isFinite(kb) || kb < 1 || kb > 20480) {
    say('Enter a target between 1 and 20,480 KB.', true);
    limitInput.focus();
    return;
  }

  clearResult();
  fileInput.disabled = true;
  go.disabled = true;
  go.textContent = 'Preparing image…';
  say('Compressing in your browser. Keep this tab open…');
  try {
    const image = await readImage(selectedFile);
    const targetBytes = Math.floor(kb * 1024);
    const result = await compressToLimit(image, targetBytes);
    if (result.blob.size > targetBytes) {
      throw new Error('The result exceeded your limit. Please try again with a larger target.');
    }
    outputUrl = URL.createObjectURL(result.blob);
    preview.src = outputUrl;
    downloadLink.href = outputUrl;
    downloadLink.download = (selectedFile.name.replace(/\.[^.]+$/, '') || 'image') + '-fyloz.jpg';
    resultInfo.textContent = formatKB(selectedFile.size) + ' original → ' + formatKB(result.blob.size) +
      ' compressed · ' + result.width + ' × ' + result.height + ' px · JPEG';
    const saved = selectedFile.size > 0 ? Math.round((1 - result.blob.size / selectedFile.size) * 100) : 0;
    savingsLabel.textContent = saved > 0 ? saved + '% smaller' : 'Within target';
    resultBox.hidden = false;
    say('Done — the output is ' + formatKB(result.blob.size) + ', within your ' + kb + ' KB limit.');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    say(error.message || 'Something went wrong. Please try another image.', true);
  } finally {
    fileInput.disabled = false;
    go.disabled = false;
    go.innerHTML = 'Prepare image <span aria-hidden="true">↗</span>';
  }
});

window.addEventListener('beforeunload', clearResult);
