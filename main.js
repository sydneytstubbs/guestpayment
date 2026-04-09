const S = {
  findMethod: 'acct', subscriber: 'Lily Allen', acctNum: '192829918',
  amtMethod: 'total', payMethod: 'card', amount: '$127.50', methodLbl: 'Debit or Credit Card',
  bankAcctNum: '', bankAcctType: '',
  wantsAutopay: false,
  ap: { payDay: '', firstPayDate: '', payDateLabel: '' },
  _successDate: '',
};

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showTooltip(id, e) {
  e.stopPropagation();
  // Hide any other open tooltips first
  document.querySelectorAll('.acct-tooltip').forEach(t => t.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

function showHoverTooltip(e, text) {
  const tip = document.getElementById('hover-tooltip');
  tip.textContent = text;
  tip.style.display = 'block';
  tip.style.left = e.clientX + 'px';
  tip.style.top  = e.clientY + 'px';
}
function hideHoverTooltip() {
  document.getElementById('hover-tooltip').style.display = 'none';
}
function moveHoverTooltip(e) {
  const tip = document.getElementById('hover-tooltip');
  tip.style.left = e.clientX + 'px';
  tip.style.top  = e.clientY + 'px';
}

document.addEventListener('click', function() {
  document.querySelectorAll('.acct-tooltip').forEach(t => t.classList.remove('visible'));
});

function selectFind(m) {
  S.findMethod = m;
  ['acct','ssn'].forEach(k => {
    document.getElementById('find-'+k+'-row').classList.toggle('selected', k === m);
    document.getElementById('find-'+k+'-fields').classList.toggle('open', k === m);
  });
}

function selectAmount(m) {
  S.amtMethod = m;
  document.getElementById('amt-total-row').classList.toggle('selected', m === 'total');
  document.getElementById('amt-custom-row').classList.toggle('selected', m === 'custom');
  document.getElementById('amt-custom-fields').classList.toggle('open', m === 'custom');
  if (m === 'total') { S.amount = '$127.50'; }
  else { setTimeout(() => document.getElementById('custom-amt').focus(), 50); }
}

function selectPayMethod(m) {
  S.payMethod = m;
  document.getElementById('pay-card-row').classList.toggle('selected', m === 'card');
  document.getElementById('pay-bank-row').classList.toggle('selected', m === 'bank');
  document.getElementById('card-fields').classList.toggle('open', m === 'card');
  document.getElementById('bank-fields').classList.toggle('open', m === 'bank');
}

function clearPayFields() {
  ['card-num','card-exp','card-cvv','card-name','bank-acct-num','confirm-acct',
   'routing-num','confirm-routing','bank-addr1','bank-addr2','bank-city','bank-zip'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('err'); }
    const er = document.getElementById('err-'+id);
    if (er) er.classList.remove('show');
  });
  ['bank-type','bank-state'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('has-val','err'); }
  });
  // Reset autopay checkbox
  S.wantsAutopay = false;
  const cb = document.getElementById('wants-autopay');
  if (cb) cb.checked = false;
}

function vReq(inputId, errId) {
  const el = document.getElementById(inputId), er = document.getElementById(errId);
  const bad = !el || !el.value.trim();
  if (el) el.classList.toggle('err', bad);
  if (er) er.classList.toggle('show', bad);
  return !bad;
}
function vMatch(id1, id2, errId) {
  const v1 = document.getElementById(id1).value, el2 = document.getElementById(id2), er = document.getElementById(errId);
  const bad = !el2.value.trim() || v1 !== el2.value;
  el2.classList.toggle('err', bad);
  if (er) er.classList.toggle('show', bad);
  return !bad;
}
function vSel(selId, errId) {
  const el = document.getElementById(selId), er = document.getElementById(errId);
  const bad = !el.value;
  el.classList.toggle('err', bad);
  if (er) er.classList.toggle('show', bad);
  return !bad;
}

function submitFind() {
  let ok = true;
  if (S.findMethod === 'acct') {
    if (!vReq('f-acctnum','err-f-acctnum')) ok = false;
    if (!vReq('f-dob-day','err-f-dob-day')) ok = false;
    if (!vReq('f-dob-month','err-f-dob-month')) ok = false;
    if (!vReq('f-dob-year','err-f-dob-year')) ok = false;
    if (!vReq('f-zip','err-f-zip')) ok = false;
  } else {
    if (!vReq('f-ssn','err-f-ssn')) ok = false;
    if (!vReq('f-ssn-dob','err-f-ssn-dob')) ok = false;
    if (!vReq('f-ssn-zip','err-f-ssn-zip')) ok = false;
  }
  if (!ok) return;

  if (S.findMethod === 'acct') {
    S.acctNum = document.getElementById('f-acctnum').value.trim();
  }

  document.getElementById('pay-subscriber').textContent = S.subscriber;
  document.getElementById('pay-acctnum').textContent = S.acctNum;
  goTo('s-payment');
}

function submitPayment() {
  let ok = true;
  if (S.amtMethod === 'custom') {
    const ca = document.getElementById('custom-amt');
    if (!ca.value.trim()) { ca.classList.add('err'); document.getElementById('err-custom-amt').classList.add('show'); ok = false; }
    else { ca.classList.remove('err'); document.getElementById('err-custom-amt').classList.remove('show'); S.amount = ca.value.startsWith('$') ? ca.value : '$'+ca.value; }
  } else { S.amount = '$127.50'; }

  if (S.payMethod === 'card') {
    if (!vReq('card-num','err-card-num')) ok = false;
    if (!vReq('card-exp','err-card-exp')) ok = false;
    if (!vReq('card-cvv','err-card-cvv')) ok = false;
    if (!vReq('card-name','err-card-name')) ok = false;
    if (ok) S.methodLbl = 'Visa ****' + (document.getElementById('card-num').value.replace(/\s/g,'').slice(-4) || '4242');
  } else {
    if (!vSel('bank-type','err-bank-type')) ok = false;
    if (!vReq('bank-acct-num','err-bank-acct-num')) ok = false;
    if (!vMatch('bank-acct-num','confirm-acct','err-confirm-acct')) ok = false;
    if (!vReq('routing-num','err-routing-num')) ok = false;
    if (!vMatch('routing-num','confirm-routing','err-confirm-routing')) ok = false;
    if (!vReq('bank-addr1','err-bank-addr1')) ok = false;
    if (!vReq('bank-city','err-bank-city')) ok = false;
    if (!vSel('bank-state','err-bank-state')) ok = false;
    if (!vReq('bank-zip','err-bank-zip')) ok = false;
    if (ok) {
      S.bankAcctNum  = document.getElementById('bank-acct-num').value;
      S.bankAcctType = document.getElementById('bank-type').value;
      S.methodLbl    = S.bankAcctType + ' ****' + S.bankAcctNum.slice(-4);
    }
  }
  if (!ok) return;

  document.getElementById('rev-amt').textContent    = S.amount;
  document.getElementById('rev-sub').textContent    = S.subscriber;
  document.getElementById('rev-acct').textContent   = S.acctNum;
  document.getElementById('rev-method').textContent = S.methodLbl;
  goTo('s-review');
}

function submitReview() {
  const now = new Date();
  S._successDate = now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) + ' at ' + now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

  document.getElementById('suc-date').textContent  = S._successDate;
  document.getElementById('suc-amt').textContent   = S.amount;
  document.getElementById('suc-sub').textContent   = S.subscriber;
  document.getElementById('suc-acct').textContent  = S.acctNum;

  const isBank = S.payMethod === 'bank';

  // Payment method display — full masking for bank as shown in design
  if (isBank) {
    const masked = S.bankAcctType + ' ********' + S.bankAcctNum.slice(-4);
    document.getElementById('suc-method').textContent    = masked;
    document.getElementById('ap-sum-method').textContent = masked;
  } else {
    document.getElementById('suc-method').textContent = S.methodLbl;
  }

  // Show AutoPay setup card only for bank users who opted in
  const showAutopay = isBank && S.wantsAutopay;
  document.getElementById('suc-autopay-card').style.display = showAutopay ? 'block' : 'none';

  // Update next steps body copy based on whether autopay is available
  if (isBank) {
    document.getElementById('suc-next-body').textContent = 'Save your info to manage AutoPay, view billing history, and go paperless.';
  }

  goTo('s-success');
}

function sendReceipt() {
  const el = document.getElementById('receipt-email'), er = document.getElementById('err-receipt');
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
  el.classList.toggle('err', !ok); er.classList.toggle('show', !ok);
  if (!ok) return;
  const bar = document.getElementById('snackbar');
  bar.classList.add('show');
  setTimeout(() => bar.classList.remove('show'), 2000);
}

function ordinalSuffix(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function calcFirstPayDate(day) {
  const today = new Date(), y = today.getFullYear(), m = today.getMonth();
  let c = new Date(y, m, day);
  if (c <= today) c = new Date(y, m + 1, day);
  return c.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function updateFirstPayDate() {
  const sel = document.getElementById('ap-pay-day'), day = parseInt(sel.value);
  if (!day) return;
  const dateStr = calcFirstPayDate(day);
  S.ap.payDay = day;
  S.ap.firstPayDate = dateStr;
  S.ap.payDateLabel = ordinalSuffix(day) + 'th of each month';
  document.getElementById('ap-sum-paydate').textContent  = ordinalSuffix(day) + ' of each month';
  document.getElementById('ap-sum-firstpay').textContent = dateStr;
}

function confirmAutopay() {
  if (!vSel('ap-pay-day','err-ap-pay-day')) return;

  const cb = document.getElementById('ap-auth-check');
  if (!cb.checked) {
    cb.style.outline = '2px solid #d32f2f';
    setTimeout(() => cb.style.outline = '', 2000);
    return;
  }

  const maskedMethod = S.bankAcctType + ' ********' + S.bankAcctNum.slice(-4);
  const emailVal = document.getElementById('ap-email').value || '—';

  // Populate enrolled screen
  document.getElementById('enr-date').textContent       = S._successDate;
  document.getElementById('enr-conf-num').textContent   = document.getElementById('suc-conf-num').textContent;
  document.getElementById('enr-amt').textContent        = S.amount;
  document.getElementById('enr-sub').textContent        = S.subscriber;
  document.getElementById('enr-acct').textContent       = S.acctNum;
  document.getElementById('enr-method').textContent     = maskedMethod;
  document.getElementById('enr-ap-method').textContent  = maskedMethod;
  document.getElementById('enr-ap-paydate').textContent = S.ap.payDateLabel || '—';
  document.getElementById('enr-ap-nextpay').textContent = S.ap.firstPayDate || '—';
  document.getElementById('enr-ap-email').textContent   = emailVal;

  goTo('s-enrolled');
}

function submitAccount() {
  let ok = true;
  if (!vReq('a-first','err-a-first')) ok = false;
  if (!vReq('a-last','err-a-last')) ok = false;
  const ae = document.getElementById('a-email');
  const aev = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ae.value);
  ae.classList.toggle('err', !aev); document.getElementById('err-a-email').classList.toggle('show', !aev);
  if (!aev) ok = false;
  if (!vReq('a-pw','err-a-pw')) ok = false;
  if (!vMatch('a-pw','a-pw2','err-a-pw2')) ok = false;
  if (!ok) return;
  alert('Account created! (prototype end state)');
}

/* INPUT MASKS */
// DOB fields — numeric only + auto-advance
document.getElementById('f-dob-day').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g,'').substring(0,2);
  this.classList.remove('err');
  document.getElementById('err-f-dob-day').classList.remove('show');
  if (this.value.length === 2) document.getElementById('f-dob-month').focus();
});
document.getElementById('f-dob-month').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g,'').substring(0,2);
  this.classList.remove('err');
  document.getElementById('err-f-dob-month').classList.remove('show');
  if (this.value.length === 2) document.getElementById('f-dob-year').focus();
});
document.getElementById('f-dob-year').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g,'').substring(0,4);
  this.classList.remove('err');
  document.getElementById('err-f-dob-year').classList.remove('show');
});
document.getElementById('card-num').addEventListener('input', function() { this.value = this.value.replace(/\D/g,'').substring(0,16).replace(/(.{4})/g,'$1 ').trim(); });
document.getElementById('card-exp').addEventListener('input', function() { let v = this.value.replace(/\D/g,'').substring(0,4); if (v.length >= 3) v = v.slice(0,2)+'/'+v.slice(2); this.value = v; });
document.getElementById('f-zip').addEventListener('input', function() { this.value = this.value.replace(/\D/g,'').substring(0,5); });
document.getElementById('f-ssn-zip').addEventListener('input', function() { this.value = this.value.replace(/\D/g,'').substring(0,5); });
document.getElementById('f-ssn').addEventListener('input', function() { this.value = this.value.replace(/\D/g,'').substring(0,4); });
document.getElementById('bank-zip').addEventListener('input', function() { this.value = this.value.replace(/\D/g,'').substring(0,5); });

document.querySelectorAll('select').forEach(sel => {
  sel.addEventListener('change', function() {
    this.classList.toggle('has-val', !!this.value);
    this.classList.remove('err');
    const er = document.getElementById('err-'+this.id);
    if (er) er.classList.remove('show');
  });
});

(function init() {
  // Populate payment day dropdown
  const daySelect = document.getElementById('ap-pay-day');
  for (let d = 1; d <= 28; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = ordinalSuffix(d) + ' of every month';
    daySelect.appendChild(opt);
  }
  selectAmount('total');
  selectPayMethod('card');
})();