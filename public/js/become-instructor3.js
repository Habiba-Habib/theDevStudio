document.addEventListener('DOMContentLoaded', () => {

  const chkAccurate = document.getElementById('chkAccurate');
  const chkPolicies = document.getElementById('chkPolicies');
  const btnSubmit   = document.getElementById('btnSubmit');

  function updateSubmitState() {
    btnSubmit.disabled = !(chkAccurate.checked && chkPolicies.checked);
  }

  chkAccurate.addEventListener('change', updateSubmitState);
  chkPolicies.addEventListener('change', updateSubmitState);
  updateSubmitState();

});