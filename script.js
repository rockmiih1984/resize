const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img');
const previewPlaceholder = document.getElementById('preview-placeholder');
const controls = document.getElementById('controls');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const lockAspect = document.getElementById('lock-aspect');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const downloadBtn = document.getElementById('download-btn');
const fileInfo = document.getElementById('file-info');
const originalSizeSpan = document.getElementById('original-size');
const newSizeSpan = document.getElementById('new-size');

let originalImage = null;
let originalAspectRatio = 0;
let fileName = '';

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-brand-400', 'bg-slate-800/80');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-brand-400', 'bg-slate-800/80');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-brand-400', 'bg-slate-800/80');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

widthInput.addEventListener('input', () => {
    if (lockAspect.checked && originalAspectRatio) {
        heightInput.value = Math.round(widthInput.value / originalAspectRatio);
    }
    updateNewSizeInfo();
});

heightInput.addEventListener('input', () => {
    if (lockAspect.checked && originalAspectRatio) {
        widthInput.value = Math.round(heightInput.value * originalAspectRatio);
    }
    updateNewSizeInfo();
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
});

downloadBtn.addEventListener('click', downloadImage);

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
    }

    fileName = file.name.split('.')[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;

        originalImage.onload = () => {
            originalAspectRatio = originalImage.width / originalImage.height;

            // Set initial values
            widthInput.value = originalImage.width;
            heightInput.value = originalImage.height;

            // Show preview
            previewImg.src = originalImage.src;
            previewImg.classList.remove('hidden');
            previewPlaceholder.classList.add('hidden');

            // Enable controls
            controls.classList.remove('opacity-50', 'pointer-events-none', 'blur-[2px]');

            // Show info
            fileInfo.classList.remove('opacity-0');
            originalSizeSpan.textContent = `Original: ${originalImage.width} x ${originalImage.height}`;
            updateNewSizeInfo();
        };
    };

    reader.readAsDataURL(file);
}

function updateNewSizeInfo() {
    const w = widthInput.value || 0;
    const h = heightInput.value || 0;
    newSizeSpan.textContent = `Novo: ${w} x ${h}`;
}

function downloadImage() {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const quality = parseInt(qualitySlider.value) / 100;

    if (!width || !height) {
        alert('Por favor, defina dimensões válidas.');
        return;
    }

    canvas.width = width;
    canvas.height = height;

    // Better quality resizing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(originalImage, 0, 0, width, height);

    // Convert to blob/url
    const format = 'image/jpeg'; // Default to jpeg for quality control
    const dataUrl = canvas.toDataURL(format, quality);

    const link = document.createElement('a');
    link.download = `${fileName}-resized.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
