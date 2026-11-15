// إعدادات الموقع

// رقم واتساب المدير الذي تصله الطلبات (مع رمز العراق 964، بدون الصفر)
const MANAGER_PHONE = '9647812502400';
const COUNTRY_CODE = '964';
const REPLY_PAGE = 'https://86msa.github.io/ijaza/r.html';

// رابط Google Apps Script (Web app) الذي يحفظ الطلبات في «سجل الإجازات».
// إذا كان فارغًا يعمل الموقع بدون حفظ.
const SHEET_URL = '';

// يرسل بيانات إلى الجدول بدون انتظار الرد
function saveToSheet(data) {
  if (!SHEET_URL) return;
  try {
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch (_) {}
}
