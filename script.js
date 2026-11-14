const form = document.getElementById('leaveForm');
const daysEl = document.getElementById('days');
const errorEl = document.getElementById('error');
const done = document.getElementById('done');
const summary = document.getElementById('summary');

// الحد الأدنى لتاريخ البداية هو اليوم
const today = new Date().toISOString().slice(0, 10);
form.start.min = today;
form.end.min = today;

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
    errorEl.textContent = 'يرجى تعبئة جميع الحقول المطلوبة.';
    form.reportValidity();
    return;
  }
  const days = countDays();
  if (!days) {
    errorEl.textContent = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.';
    return;
  }

  const data = {
    name: form.name.value.trim(),
    empId: form.empId.value.trim(),
    dept: form.dept.value.trim(),
    type: form.type.value,
    start: form.start.value,
    end: form.end.value,
    days,
    reason: form.reason.value.trim(),
    createdAt: new Date().toISOString(),
  };

  // حفظ مؤقت في المتصفح حتى يتم ربط الموقع بخادم
  try {
    const all = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    all.push(data);
    localStorage.setItem('leaveRequests', JSON.stringify(all));
  } catch (_) {}

  const rows = [
    ['الاسم', data.name], ['الرقم الوظيفي', data.empId], ['القسم', data.dept],
    ['النوع', data.type], ['من', data.start], ['إلى', data.end],
    ['عدد الأيام', data.days],
  ];
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
  form.reset();
  daysEl.textContent = '';
  done.hidden = true;
  form.hidden = false;
});
