document.addEventListener('DOMContentLoaded', () => {
  const chkAccurate = document.getElementById('chkAccurate');
  const chkPolicies = document.getElementById('chkPolicies');
  const btnSubmit = document.getElementById('btnSubmit');
  const form = document.getElementById('verificationForm');
  const hidAccurate = document.getElementById('agreeAccurateHidden');
  const hidPolicies = document.getElementById('agreePoliciesHidden');

  function updateSubmitState() {
    const ok = chkAccurate.checked && chkPolicies.checked;
    btnSubmit.disabled = !ok;
    hidAccurate.value = chkAccurate.checked ? 'on' : '';
    hidPolicies.value = chkPolicies.checked ? 'on' : '';
  }

  chkAccurate.addEventListener('change', updateSubmitState);
  chkPolicies.addEventListener('change', updateSubmitState);

  form.addEventListener('submit', (e) => {
    if (!chkAccurate.checked || !chkPolicies.checked) {
      e.preventDefault();
    }
  });

  updateSubmitState();
});