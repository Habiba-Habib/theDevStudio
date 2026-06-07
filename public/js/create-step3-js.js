// ══════════════════════════════════════════════════════════════
// FREE COURSE TOGGLE
// ══════════════════════════════════════════════════════════════

const freeToggle = document.getElementById('free-toggle');
const priceInput = document.getElementById('price-input');
const durationInput = document.getElementById('duration-input');
const publishBtn = document.querySelector('.btn-publish-now');


// ADD THIS CODE - Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  // If price is 0 or empty, check the toggle and disable input
  const currentPrice = parseFloat(priceInput.value);
  if (currentPrice === 0 || !priceInput.value) {
    freeToggle.checked = true;
    priceInput.disabled = true;
    priceInput.style.opacity = '0.5';
    document.getElementById('preview-price').textContent = 'FREE';
  } else {
    // If there's a price, make sure toggle is unchecked
    freeToggle.checked = false;
    priceInput.disabled = false;
    priceInput.style.opacity = '1';
    updatePricePreview();
  }
});

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
  // Don't clear value - keep existing price if any
  if (!priceInput.value || priceInput.value === '0') {
    priceInput.value = '';
  }
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

function showPopup(message, type = 'success') {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  

let icon = 'fa-check-circle';   // ✅ success
let title = 'Success!';

if (type === 'info') {
  icon = 'fa-info-circle';      // ℹ️ info
  title = 'Info';
} else if (type === 'warning') {
  icon = 'fa-exclamation-triangle'; // ⚠️ warning
  title = 'Warning';
} else if (type === 'error') {
  icon = 'fa-times-circle';    // ❌ error
  title = 'Error';
}


  
  // Create modal card
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-icon ${type}">
        <i class="fa-solid ${icon}"></i>
      </div>
      <h3 class="modal-title">${title}</h3>
      <p class="modal-message">${message}</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Show with animation
  setTimeout(() => overlay.classList.add('show'), 10);
  
  // Auto-hide after 2.5 seconds
  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }, 2500);
}






// ══════════════════════════════════════════════════════════════
// FORM SUBMIT HANDLER
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('publish-form');
  const publishBtn = document.querySelector('.btn-publish-now');
  
  if (publishBtn) {
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
      
      // Show loading state
      publishBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';
      publishBtn.disabled = true;
      
      // Create form data
      const formData = new URLSearchParams();
      formData.append('action', 'publish');
      formData.append('price', priceInput.value);
      formData.append('duration', duration + ' hours');
      
      // Submit via fetch
      fetch('/instructor/create/step3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Show popup with approval message
          showPopup('Course submitted for admin approval! You will be notified once it has been reviewed.', 'info');
          
          // Redirect after 2.5 seconds
          setTimeout(() => {
            window.location.href = data.redirectUrl || '/instructor/dashboard';
          }, 2500);
        } else {
          alert('Error: ' + (data.message || 'Unknown error'));
          publishBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> Publish Course';
          publishBtn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error submitting course. Please try again.');
        publishBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> Publish Course';
        publishBtn.disabled = false;
      });
    });
  }
  
  // Initialize preview with current values
  updatePricePreview();
  const duration = durationInput.value.trim();
  if (duration) {
    document.getElementById('preview-duration').textContent = duration + ' hours';
  }
});
function deleteDraft() {
  // Get courseId from hidden input
  const courseId = document.querySelector('input[name="courseId"]').value;
  
  if (!courseId) {
    alert('No draft found to delete');
    return;
  }
  
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
    return;
  }
  
  // Show loading state
  const deleteBtn = document.querySelector('.btn-delete-draft');
  const originalHTML = deleteBtn.innerHTML;
  deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
  deleteBtn.disabled = true;
  
  // Send delete request
  fetch(`/instructor/delete-draft/${courseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(response => {
    if (response.ok) {
      // Show success popup
      showPopup('Draft deleted successfully!', 'success');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/instructor/dashboard';
      }, 1500);
    } else {
      throw new Error('Failed to delete draft');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error deleting draft. Please try again.');
    deleteBtn.innerHTML = originalHTML;
    deleteBtn.disabled = false;
  });
}

// Clear validation errors on input
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('input', () => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
});
