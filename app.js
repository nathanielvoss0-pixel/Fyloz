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

const pageLanguage = document.documentElement.lang || 'en';
const copy = {
  en: {
    select: 'Select an image to get started.',
    picker: 'Please choose a JPG, PNG, or WebP image.',
    tooLarge: 'This image is over 20 MB. Choose a smaller file.',
    ready: 'Ready to prepare.',
    pickerFallback: 'Use the file picker to select your image.',
    chooseFirst: 'Choose an image first.',
    invalidLimit: 'Enter a target between 1 and 20,480 KB.',
    preparing: 'Preparing image…',
    compressing: 'Compressing in your browser. Keep this tab open…',
    original: 'original →',
    compressed: 'compressed',
    jpeg: 'JPEG',
    smaller: '% smaller',
    withinTarget: 'Within target',
    done: (size, kb) => 'Done — the output is ' + size + ', within your ' + kb + ' KB limit.',
    prepareButton: 'Prepare image <span aria-hidden="true">↗</span>',
    compressedTitle: 'Your compressed image',
    download: 'Download compressed image',
    openError: 'The browser could not open this image. Try another file.',
    encodeError: 'Your browser could not create the compressed image.',
    prepareError: 'Your browser could not prepare this image.',
    targetError: 'This target is too small to reach reliably. Try a larger KB limit.',
    exceededError: 'The result exceeded your limit. Please try again with a larger target.',
    genericError: 'Something went wrong. Please try another image.',
    failureCategory: error => error.message.includes('could not open') ? 'image_open'
      : error.message.includes('could not create') ? 'jpeg_encode'
      : error.message.includes('could not prepare') ? 'canvas_prepare'
      : error.message.includes('too small to reach') ? 'target_unreachable'
      : error.message.includes('exceeded your limit') ? 'target_exceeded' : 'unknown'
  },
  ar: {
    select: 'اختر صورة للبدء.',
    picker: 'اختر صورة بصيغة JPG أو PNG أو WebP.',
    tooLarge: 'حجم الصورة يتجاوز 20 ميغابايت. اختر صورة أصغر.',
    ready: 'جاهزة للمعالجة.',
    pickerFallback: 'استخدم زر اختيار الملف لتحديد الصورة.',
    chooseFirst: 'اختر صورة أولاً.',
    invalidLimit: 'أدخل حداً بين 1 و20,480 كيلوبايت.',
    preparing: 'جارٍ تجهيز الصورة…',
    compressing: 'جارٍ ضغط الصورة في متصفحك. اترك هذه الصفحة مفتوحة…',
    original: 'الحجم الأصلي ←',
    compressed: 'بعد الضغط',
    jpeg: 'JPEG',
    smaller: '% أصغر',
    withinTarget: 'ضمن الحد',
    done: (size, kb) => 'تم الضغط. حجم الصورة ' + size + '، ضمن حد ' + kb + ' كيلوبايت.',
    prepareButton: 'جهّز الصورة <span aria-hidden="true">↗</span>',
    compressedTitle: 'الصورة بعد الضغط',
    download: 'نزّل الصورة المضغوطة',
    openError: 'تعذّر فتح الصورة في المتصفح. جرّب ملفاً آخر.',
    encodeError: 'تعذّر على المتصفح إنشاء الصورة المضغوطة.',
    prepareError: 'تعذّر تجهيز الصورة في المتصفح.',
    targetError: 'تعذّر الوصول إلى هذا الحجم. جرّب حداً أكبر بالكيلوبايت.',
    exceededError: 'تجاوز الملف الناتج الحد المطلوب. جرّب حداً أكبر.',
    genericError: 'حدث خطأ. جرّب صورة أخرى.',
    failureCategory: error => error.message.includes('could not open') ? 'image_open'
      : error.message.includes('could not create') ? 'jpeg_encode'
      : error.message.includes('could not prepare') ? 'canvas_prepare'
      : error.message.includes('too small to reach') ? 'target_unreachable'
      : error.message.includes('exceeded your limit') ? 'target_exceeded' : 'unknown'
  },
  fr: {
    select: 'Choisissez une image pour commencer.',
    picker: 'Choisissez une image JPG, PNG ou WebP.',
    tooLarge: 'Cette image dépasse 20 Mo. Choisissez un fichier plus petit.',
    ready: 'Prête à être traitée.',
    pickerFallback: 'Utilisez le sélecteur de fichiers pour choisir une image.',
    chooseFirst: 'Choisissez d’abord une image.',
    invalidLimit: 'Saisissez une limite entre 1 et 20 480 Ko.',
    preparing: 'Préparation de l’image…',
    compressing: 'Compression dans votre navigateur. Gardez cette page ouverte…',
    original: 'original →',
    compressed: 'compressée',
    jpeg: 'JPEG',
    smaller: '% plus petite',
    withinTarget: 'Dans la limite',
    done: size => 'Terminé : le fichier fait ' + size + ' et respecte la limite.',
    prepareButton: 'Préparer l’image <span aria-hidden="true">↗</span>',
    compressedTitle: 'Votre image compressée',
    download: 'Télécharger l’image compressée',
    openError: 'Le navigateur ne peut pas ouvrir cette image. Essayez un autre fichier.',
    encodeError: 'Le navigateur ne peut pas créer l’image compressée.',
    prepareError: 'Le navigateur ne peut pas préparer cette image.',
    targetError: 'Cette limite est trop basse pour être atteinte. Essayez une valeur plus élevée.',
    exceededError: 'Le fichier dépasse la limite. Essayez une valeur plus élevée.',
    genericError: 'Une erreur s’est produite. Essayez une autre image.',
    failureCategory: error => error.message.includes('could not open') ? 'image_open'
      : error.message.includes('could not create') ? 'jpeg_encode'
      : error.message.includes('could not prepare') ? 'canvas_prepare'
      : error.message.includes('too small to reach') ? 'target_unreachable'
      : error.message.includes('exceeded your limit') ? 'target_exceeded' : 'unknown'
  }
};
const ui = copy[pageLanguage] || copy.en;
function trackCompressionEvent(name, parameters) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, { language: pageLanguage, ...parameters });
}
function localizedError(error) {
  const message = error && error.message ? error.message : '';
  if (message.includes('could not open')) return ui.openError;
  if (message.includes('could not create')) return ui.encodeError;
  if (message.includes('could not prepare')) return ui.prepareError;
  if (message.includes('too small to reach')) return ui.targetError;
  if (message.includes('exceeded your limit')) return ui.exceededError;
  return ui.genericError;
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
    say(ui.pickerFallback, true);
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
  const unit = pageLanguage === 'fr' ? 'Ko' : 'KB';
  return (bytes / 1024).toFixed(bytes < 10 * 1024 ? 2 : 1) + ' ' + unit;
}
function setLimit(value) {
  limitInput.value = value;
  document.querySelectorAll('[data-kb]').forEach(button => {
    const active = Number(button.dataset.kb) === Number(value);
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

const requestedKB = Number(new URLSearchParams(window.location.search).get('kb'));
if ([50, 100, 200, 500].includes(requestedKB)) setLimit(requestedKB);
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
    say(ui.select);
    return;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
    selectedFile = null;
    fileInput.value = '';
    say(ui.picker, true);
    return;
  }
  if (selectedFile.size > 20 * 1024 * 1024) {
    selectedFile = null;
    fileInput.value = '';
    say(ui.tooLarge, true);
    return;
  }
  say(selectedFile.name + ' · ' + formatKB(selectedFile.size) + ' · ' + ui.ready);
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
    say(ui.chooseFirst, true);
    fileInput.focus();
    return;
  }
  const kb = Number(limitInput.value);
  if (!Number.isFinite(kb) || kb < 1 || kb > 20480) {
    say(ui.invalidLimit, true);
    limitInput.focus();
    return;
  }

  clearResult();
  fileInput.disabled = true;
  go.disabled = true;
  go.textContent = ui.preparing;
  say(ui.compressing);
  trackCompressionEvent('compress_start', { target_kb: kb });
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
    resultInfo.textContent = formatKB(selectedFile.size) + ' ' + ui.original + ' ' + formatKB(result.blob.size) +
      ' ' + ui.compressed + ' · ' + result.width + ' × ' + result.height + ' px · ' + ui.jpeg;
    const saved = selectedFile.size > 0 ? Math.round((1 - result.blob.size / selectedFile.size) * 100) : 0;
    savingsLabel.textContent = saved > 0 ? saved + ui.smaller : ui.withinTarget;
    resultBox.hidden = false;
    trackCompressionEvent('compress_success', {
      target_kb: kb,
      output_kb: Math.round(result.blob.size / 1024)
    });
    say(ui.done(formatKB(result.blob.size), kb));
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    trackCompressionEvent('compress_error', {
      target_kb: kb,
      error_category: ui.failureCategory(error)
    });
    say(localizedError(error), true);
  } finally {
    fileInput.disabled = false;
    go.disabled = false;
    go.innerHTML = ui.prepareButton;
  }
});

window.addEventListener('beforeunload', clearResult);
