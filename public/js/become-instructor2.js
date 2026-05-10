document.addEventListener('DOMContentLoaded', () => {

 
  setupUploadZone('cvZone', 'cvInput', 'cvContent', 'cvPreview', 'cvFileName', 'cvRemove', 10);
  setupUploadZone('certZone', 'certInput', 'certContent', 'certPreview', 'certFileName', 'certRemove', 10);

  function setupUploadZone(zoneId, inputId, contentId, previewId, fileNameId, removeId, maxMB) {
    const zone      = document.getElementById(zoneId);
    const input     = document.getElementById(inputId);
    const content   = document.getElementById(contentId);
    const preview   = document.getElementById(previewId);
    const fileName  = document.getElementById(fileNameId);
    const removeBtn = document.getElementById(removeId);

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
      if (file) handleFile(file);
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


  document.getElementById('btnContinue').addEventListener('click', () => {
    const cvInput   = document.getElementById('cvInput');
    const certInput = document.getElementById('certInput');
    const cvZone    = document.getElementById('cvZone');
    const certZone  = document.getElementById('certZone');

    let valid = true;

    if (!cvInput.files.length) {
      showError(cvZone, 'Please upload your CV / Resume.');
      valid = false;
    } else {
      clearError(cvZone);
    }

    if (!certInput.files.length) {
      showError(certZone, 'Please upload your Professional Verification Document.');
      valid = false;
    } else {
      clearError(certZone);
    }

    if (!valid) return;

    window.location.href = '../pages/instructor/become-instructor3.html';
  });

});