// رقم واتساب المدير الذي تصله الطلبات (مع رمز العراق 964، بدون الصفر)
const MANAGER_PHONE = '9647812502400';
const COUNTRY_CODE = '964';

const form = document.getElementById('leaveForm');
const daysEl = document.getElementById('days');
const errorEl = document.getElementById('error');
const done = document.getElementById('done');
const summary = document.getElementById('summary');
const sendLink = document.getElementById('sendLink');

const today = new Date().toISOString().slice(0, 10);
form.start.min = today;
form.end.min = today;

// يحوّل الرقم المحلي العراقي إلى صيغة دولية: 07701234567 → 9647701234567
// يقبل أيضًا الرقم إذا كُتب مع 964 أو +964 أو 00964
function toIraqi(s) {
  let d = s.replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g, '');
  d = d.replace(/^00/, '');
  if (d.startsWith(COUNTRY_CODE)) d = d.slice(COUNTRY_CODE.length);
  d = d.replace(/^0+/, '');
  return /^7\d{9}$/.test(d) ? COUNTRY_CODE + d : null;
}
const waLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

function countDays() {
  const { start, end } = form;
  if (start.value) end.min = start.value;
  if (!start.value || !end.value) return 0;
  const diff = (new Date(end.value) - new Date(start.value)) / 86400000;
  return diff < 0 ? 0 : diff + 1;
}

function updateDays() {
  const n = countDays();
  daysEl.textContent = n ? `عدد الأيام: ${n}` : '';
}
form.start.addEventListener('change', updateDays);
form.end.addEventListener('change', updateDays);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  if (!form.checkValidity()) {
    errorEl.textContent = 'يرجى تعبئة جميع الحقول.';
    form.reportValidity();
    return;
  }
  const phone = toIraqi(form.phone.value);
  if (!phone) {
    errorEl.textContent = 'رقم الواتساب غير صحيح. اكتبه بهذا الشكل: 07701234567';
    return;
  }
  const days = countDays();
  if (!days) {
    errorEl.textContent = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساويًا له.';
    return;
  }

  const name = form.name.value.trim();
  const reason = form.reason.value.trim();
  const period = form.start.value === form.end.value
    ? form.start.value
    : `من ${form.start.value} إلى ${form.end.value}`;

  // رسائل جاهزة يرسلها المدير للموظف بضغطة واحدة
  const approve = waLink(phone,
    `مرحبًا ${name}،\nتمت الموافقة على طلب إجازتك ✅\nالتاريخ: ${period} (${days} يوم)`);
  const reject = waLink(phone,
    `مرحبًا ${name}،\nنعتذر، لم تتم الموافقة على طلب إجازتك ❌\nالتاريخ: ${period}`);

  const managerMsg =
`📝 طلب إجازة جديد
الاسم: ${name}
التاريخ: ${period} (${days} يوم)
الغرض: ${reason}

✅ للموافقة وإبلاغ الموظف:
${approve}

❌ للرفض:
${reject}`;

  sendLink.href = waLink(MANAGER_PHONE, managerMsg);

  const rows = [['الاسم', name], ['التاريخ', period], ['عدد الأيام', days], ['الغرض', reason]];
  summary.replaceChildren();
  for (const [k, v] of rows) {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    summary.append(dt, dd);
  }
  form.hidden = true;
  done.hidden = false;
});

document.getElementById('again').addEventListener('click', () => {
  done.hidden = true;
  form.hidden = false;
});
