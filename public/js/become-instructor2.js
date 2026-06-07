document.addEventListener('DOMContentLoaded', () => {

  // Setup CV upload zone
  setupUploadZone('cvZone', 'cvInput', 'cvContent', 'cvPreview', 'cvFileName', 'cvRemove', 10);
  
  // Setup first certificate upload zone (certZone1)
  setupCertUploadZone(1);

  function setupUploadZone(zoneId, inputId, contentId, previewId, fileNameId, removeId, maxMB) {
    const zone      = document.getElementById(zoneId);
    const input     = document.getElementById(inputId);
    const content   = document.getElementById(contentId);
    const preview   = document.getElementById(previewId);
    const fileName  = document.getElementById(fileNameId);
    const removeBtn = document.getElementById(removeId);

    if (!zone || !input) return; // Safety check

    zone.addEventListener('click', (e) => {
      if (e.target.closest('.remove-file')) return;
      if (e.target === input) return;
      input.click();
    });

    input.addEventListener('change', () => {
      if (input.files.length) handleFile(input.files[0]);
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        // Set the file to the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFile(file);
      }
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = '';
      showEmpty();
    });

    function handleFile(file) {
      if (file.size > maxMB * 1024 * 1024) {
        showError(zone, `File too large. Maximum size is ${maxMB}MB.`);
        return;
      }
      clearError(zone);
      fileName.textContent = file.name;
      content.classList.add('hidden');
      preview.classList.remove('hidden');
    }

    function showEmpty() {
      content.classList.remove('hidden');
      preview.classList.add('hidden');
      fileName.textContent = '';
    }
  }

  function showError(zone, message) {
    clearError(zone);
    const err = document.createElement('p');
    err.className = 'inline-error';
    err.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    zone.insertAdjacentElement('afterend', err);
    setTimeout(() => clearError(zone), 4000);
  }

  function clearError(zone) {
    const next = zone.nextElementSibling;
    if (next && next.classList.contains('inline-error')) next.remove();
  }

  // Form validation
  document.getElementById('btnContinue').addEventListener('click', (e) => {
    e.preventDefault();

    const cvInput   = document.getElementById('cvInput');
    const certInput1 = document.getElementById('certInput1'); // Changed from certInput
    const cvZone    = document.getElementById('cvZone');
    const certZone1  = document.getElementById('certZone1'); // Changed from certZone

    let valid = true;

    if (!cvInput.files.length) {
      showError(cvZone, 'Please upload your CV / Resume.');
      valid = false;
    } else {
      clearError(cvZone);
    }

    // Check if at least one certificate is uploaded
    const allCertInputs = document.querySelectorAll('input[name="certificates"]');
    const hasCert = Array.from(allCertInputs).some(input => input.files.length > 0);
    
    if (!hasCert) {
      showError(certZone1, 'Please upload at least one Professional Verification Document.');
      valid = false;
    } else {
      clearError(certZone1);
    }

    if (!valid) return;

    document.getElementById('pageDocuments').submit();
  });

});

// ══════════════════════════════════════════════════════════════
// MULTIPLE CERTIFICATE UPLOADS
// ══════════════════════════════════════════════════════════════

let certCount = 1;
const maxCertificates = 5;

document.getElementById('addCertBtn').addEventListener('click', function() {
  if (certCount >= maxCertificates) {
    alert(`Maximum ${maxCertificates} certificates allowed`);
    return;
  }
  
  certCount++;
  
  const container = document.getElementById('certificateContainer');
  const newUpload = document.createElement('div');
  newUpload.className = 'upload-zone certificate-upload';
  newUpload.id = `certZone${certCount}`;
  newUpload.setAttribute('data-input', `certInput${certCount}`);
  newUpload.style.marginTop = '12px';
  
  newUpload.innerHTML = `
    <input type="file" id="certInput${certCount}" name="certificates" class="file-input" accept=".pdf,.jpg,.jpeg,.png" />
    <div class="upload-content" id="certContent${certCount}">
      <i class="fa-solid fa-award upload-icon"></i>
      <p class="upload-title">Click to upload or drag and drop</p>
      <p class="upload-hint">PDF, JPG, PNG (Max 10MB)</p>
    </div>
    <div class="upload-preview hidden" id="certPreview${certCount}">
      <i class="fa-solid fa-file-lines file-icon"></i>
      <span class="file-name" id="certFileName${certCount}"></span>
      <button type="button" class="remove-file" data-cert-id="${certCount}" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `;
  
  container.appendChild(newUpload);
  setupCertUploadZone(certCount);
});

// Setup certificate upload zone with drag and drop
function setupCertUploadZone(id) {
  const zone = document.getElementById(`certZone${id}`);
  const input = document.getElementById(`certInput${id}`);
  const content = document.getElementById(`certContent${id}`);
  const preview = document.getElementById(`certPreview${id}`);
  const fileName = document.getElementById(`certFileName${id}`);
  const removeBtn = preview.querySelector('.remove-file');
  
  if (!zone || !input) return;
  
  // Click to upload
  zone.addEventListener('click', (e) => {
    if (!e.target.closest('.remove-file')) {
      input.click();
    }
  });
  
  // File selected
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileName.textContent = file.name;
      content.classList.add('hidden');
      preview.classList.remove('hidden');
    }
  });
  
  // Remove file
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    input.value = '';
    content.classList.remove('hidden');
    preview.classList.add('hidden');
    
    // If not the first one, remove the entire upload zone
    if (id > 1) {
      zone.remove();
      certCount--;
    }
  });
  
  // Drag and drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = 'var(--pink)';
    zone.style.background = 'rgba(255, 64, 160, 0.05)';
  });
  
  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '';
    zone.style.background = '';
  });
  
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = '';
    zone.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file) {
      // Properly set the file to the input element
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      fileName.textContent = file.name;
      content.classList.add('hidden');
      preview.classList.remove('hidden');
    }
  });
}
