(function(){
  const displayEl = document.getElementById('display');
  const buttons = document.querySelectorAll('.btn');
  let expr = ''; // expression shown / evaluated

  // Helpers
  function updateDisplay(){
    displayEl.textContent = expr === '' ? '0' : expr;
  }

  function appendValue(val){
    // avoid multiple leading zeros like "00"
    if (expr === '0' && val === '0') return;
    // prevent two decimal points in the same number segment
    if (val === '.') {
      const parts = expr.split(/[\+\-\*\/\(\)]/);
      const last = parts[parts.length - 1];
      if (last.includes('.')) return;
      if (last === '') { expr += '0'; } // ".5" -> "0.5"
    }
    expr += val;
    updateDisplay();
  }

  function clearAll(){
    expr = '';
    updateDisplay();
  }

  function deleteLast(){
    expr = expr.slice(0, -1);
    updateDisplay();
  }

  // sanitize input before evaluate (allow only digits, operators, parentheses and dot)
  function sanitize(input){
    // Replace Unicode × ÷ and minus signs with ascii equivalents
    input = input.replace(/[×x✕]/g, '*').replace(/[÷]/g, '/').replace(/–|−/g, '-');
    // Remove any char not allowed
    if (!/^[0-9+\-*/().\s]*$/.test(input)) return null;
    // Basic parentheses check
    const open = (input.match(/\(/g) || []).length;
    const close = (input.match(/\)/g) || []).length;
    if (open !== close) return null;
    return input;
  }

  function calculate(){
    if (expr.trim() === '') return;
    const safe = sanitize(expr);
    if (safe === null) {
      displayEl.textContent = 'Error';
      return;
    }
    try {
      // Use Function instead of eval for a slightly safer sandbox
      /* eslint no-new-func: "off" */
      const result = Function(`"use strict"; return (${safe})`)();
      if (result === undefined || Number.isNaN(result) || result === Infinity) {
        displayEl.textContent = 'Error';
        expr = '';
        return;
      }
      // format result: remove trailing zeros from floats
      expr = String(Number.isFinite(result) ? (Math.round((result + Number.EPSILON) * 1e12) / 1e12) : result);
      updateDisplay();
    } catch (e) {
      displayEl.textContent = 'Error';
      expr = '';
    }
  }

  // Button clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      const val = btn.dataset.value;

      if (action === 'clear') { clearAll(); return; }
      if (action === 'delete') { deleteLast(); return; }
      if (action === 'calculate') { calculate(); return; }

      // map displayed operator chars to ascii when necessary
      if (val) {
        appendValue(val);
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    // numbers
    if (/^[0-9]$/.test(key)) { appendValue(key); e.preventDefault(); return; }
    // operators
    if (key === '+' || key === '-' || key === '*' || key === '/') { appendValue(key); e.preventDefault(); return; }
    if (key === 'Enter' || key === '=') { calculate(); e.preventDefault(); return; }
    if (key === 'Backspace') { deleteLast(); e.preventDefault(); return; }
    if (key === 'Escape') { clearAll(); e.preventDefault(); return; }
    if (key === '.') { appendValue('.'); e.preventDefault(); return; }
    if (key === '(' || key === ')') { appendValue(key); e.preventDefault(); return; }
  });

  // Initialize
  updateDisplay();
})();