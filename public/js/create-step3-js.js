// ══════════════════════════════════════════════════════════════
// FREE COURSE TOGGLE
// ══════════════════════════════════════════════════════════════

const freeToggle = document.getElementById('free-toggle');
const priceInput = document.getElementById('price-input');
const durationInput = document.getElementById('duration-input');

freeToggle.addEventListener('change', function() {
  if (this.checked) {
    priceInput.value = '0';
    priceInput.disabled = true;
    priceInput.style.opacity = '0.5';
    document.getElementById('preview-price').textContent = 'FREE';
    document.getElementById('preview-price').style.fontSize = '24px';
  } else {
    priceInput.disabled = false;
    priceInput.style.opacity = '1';
    priceInput.value = '';
    updatePricePreview();
  }
});

// ══════════════════════════════════════════════════════════════
// LIVE PREVIEW UPDATES
// ══════════════════════════════════════════════════════════════

priceInput.addEventListener('input', updatePricePreview);

function updatePricePreview() {
  if (freeToggle.checked) {
    document.getElementById('preview-price').textContent = 'FREE';
    return;
  }
  
  const val = parseFloat(priceInput.value);
  if (isNaN(val) || val <= 0) {
    document.getElementById('preview-price').textContent = '$0';
  } else {
    document.getElementById('preview-price').textContent = '$' + val.toFixed(2);
  }
  document.getElementById('preview-price').style.fontSize = '28px';
}

// Duration preview update
durationInput.addEventListener('input', function() {
  const duration = this.value.trim();
  document.getElementById('preview-duration').textContent = duration || '0 hours';
});

// ══════════════════════════════════════════════════════════════
// SAVE DRAFT
// ══════════════════════════════════════════════════════════════

function saveDraft() {
  const price = freeToggle.checked ? '0' : priceInput.value;
  const duration = durationInput.value;
  
  // Validate
  if (!freeToggle.checked) {
    if (!price || parseFloat(price) < 0) {
      alert('Please enter a valid price or enable "Make this course free"');
      priceInput.focus();
      return;
    }
  }
  
  if (!duration || !duration.trim()) {
    alert('Please enter course duration');
    durationInput.focus();
    return;
  }
  
  // Show loading state
  const saveBtn = document.querySelector('.btn-save-draft');
  const originalHTML = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  saveBtn.disabled = true;
  
  // Create form data manually
  const formData = new URLSearchParams();
  formData.append('action', 'draft');
  formData.append('price', price);
  formData.append('duration', duration);
  
  // Submit via fetch
  fetch('/instructor/create/step3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Show success message
      showPopup('Draft saved successfully!', 'success');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/instructor/dashboard';
      }, 1500);
    } else {
      alert('Error saving draft: ' + (data.message || 'Unknown error'));
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error saving draft: ' + error.message + '\nPlease try again.');
    saveBtn.innerHTML = originalHTML;
    saveBtn.disabled = false;
  });
}

// ══════════════════════════════════════════════════════════════
// DELETE DRAFT
// ══════════════════════════════════════════════════════════════

function deleteDraft() {
  if (!confirm('Are you sure you want to delete this course draft? This action cannot be undone.')) {
    return;
  }
  
  // Get the course ID from the hidden input
  const courseIdInput = document.querySelector('input[name="courseId"]');
  const courseId = courseIdInput ? courseIdInput.value : null;
  
  if (!courseId) {
    alert('Error: Course ID not found');
    return;
  }
  
  // Show loading
  const deleteBtn = document.querySelector('.btn-delete-draft');
  if (deleteBtn) {
    deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
    deleteBtn.disabled = true;
  }
  
  // Send delete request with course ID in URL
  fetch('/instructor/delete-draft/' + courseId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.redirected) {
      window.location.href = response.url;
      return;
    }
    return response.json();
  })
  .then(data => {
    if (data && data.success) {
      showPopup('Draft deleted', 'info');
      setTimeout(() => {
        window.location.href = '/instructor/dashboard';
      }, 1000);
    } else if (data) {
      alert('Error deleting draft: ' + (data.message || 'Unknown error'));
      if (deleteBtn) {
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete Draft';
        deleteBtn.disabled = false;
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error deleting draft. Please try again.');
    if (deleteBtn) {
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete Draft';
      deleteBtn.disabled = false;
    }
  });
}

// ══════════════════════════════════════════════════════════════
// SHOW POPUP
// ══════════════════════════════════════════════════════════════

function showPopup(message, type = 'success') {
  const popup = document.createElement('div');
  popup.className = `popup-notification popup-${type}`;
  popup.innerHTML = `
    <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(popup);
  
  // Animate in
  setTimeout(() => popup.classList.add('show'), 10);
  
  // Remove after animation
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 300);
  }, 1500);
}


// ══════════════════════════════════════════════════════════════
// FORM SUBMIT HANDLER (SINGLE DOMContentLoaded)
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('publish-form');
  const publishBtn = document.querySelector('.btn-publish-now');
  
  if (form && publishBtn) {
    // Handle publish button click specifically
    publishBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Set price to 0 if free toggle is checked
      if (freeToggle.checked) {
        priceInput.value = '0';
      }
      
      // Validate price
      if (!freeToggle.checked) {
        const price = parseFloat(priceInput.value);
        if (isNaN(price) || price < 0) {
          alert('Please enter a valid price (0 or greater)');
          priceInput.focus();
          return false;
        }
      }
      
      // Validate duration
      const duration = durationInput.value.trim();
      if (!duration) {
        alert('Please enter the course duration');
        durationInput.focus();
        return false;
      }
      
      // Create hidden input for action=publish
      const actionInput = document.createElement('input');
      actionInput.type = 'hidden';
      actionInput.name = 'action';
      actionInput.value = 'publish';
      form.appendChild(actionInput);
      
      // Show loading state
      publishBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';
      publishBtn.disabled = true;
      
      // Submit form
      form.submit();
    });
  }
  
  // Initialize preview with current values
  updatePricePreview();
  const duration = durationInput.value.trim();
  if (duration) {
    document.getElementById('preview-duration').textContent = duration;
  }
});

// Clear validation errors on input
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('input', () => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
});



