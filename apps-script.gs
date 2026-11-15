// كود Google Apps Script لملف «سجل الإجازات».
// يُلصق في: الإضافات (Extensions) ← Apps Script، ثم يُنشر كـ Web app.
// يستقبل من الموقع طلبًا جديدًا، أو قرار القبول/الرفض، ويكتبه في تبويب «الطلبات».

const SHEET_NAME = 'الطلبات';
const STATUS = { pending: 'قيد الانتظار', approved: 'مقبولة', rejected: 'مرفوضة' };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    const id = String(d.id || '');
    if (!/^[a-z0-9]{6,20}$/.test(id)) return out('bad id');

    if (d.action === 'new') {
      if (findRow(sh, id)) return out('exists');
      const start = toDate(d.start);
      const end = toDate(d.end);
      if (!start || !end || end < start) return out('bad dates');
      const days = Math.round((end - start) / 86400000) + 1;
      const phone = String(d.phone || '').replace(/\D/g, '').slice(0, 15);
      sh.appendRow(["'" + id, new Date(), clean(d.name, 80), "'" + phone,
        start, end, days, clean(d.reason, 500), STATUS.pending, '']);
      return out('ok');
    }

    if (d.action === 'decide') {
      const status = d.status === 'approved' ? STATUS.approved
        : d.status === 'rejected' ? STATUS.rejected : null;
      const row = findRow(sh, id);
      if (!row || !status) return out('not found');
      // القرار يُسجَّل مرة واحدة فقط
      if (sh.getRange(row, 9).getValue() !== STATUS.pending) return out('already decided');
      sh.getRange(row, 9, 1, 2).setValues([[status, new Date()]]);
      return out('ok');
    }

    return out('unknown action');
  } catch (err) {
    return out('error');
  } finally {
    lock.releaseLock();
  }
}

function findRow(sh, id) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const ids = sh.getRange(2, 1, n, 1).getValues().map((r) => String(r[0]));
  const i = ids.indexOf(id);
  return i < 0 ? 0 : i + 2;
}

// يمنع النص الذي يبدأ بـ = أو + أو - أو @ من أن يُقرأ كمعادلة
function clean(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

// "2026-11-20" → تاريخ (الساعة 12 ظهرًا لتجنّب فرق المناطق الزمنية)
function toDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null;
}

function out(text) {
  return ContentService.createTextOutput(text);
}
