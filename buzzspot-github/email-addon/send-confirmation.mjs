// Buzz Spot booking confirmation email (Cloudflare Worker module).
// POST /api/send-confirmation  {to, first, room, building, floor, type, capacity, date, time, token}
// Sends through Resend (https://resend.com). Needs two Worker settings:
//   RESEND_API_KEY  (secret)  - npx wrangler secret put RESEND_API_KEY
//   EMAIL_FROM      (var)     - e.g. "Buzz Spot <bookings@yourdomain.com>" on a domain verified in Resend
// Guardrails: only @gatech.edu recipients, only same-site requests, the server writes the email
// itself (no caller-supplied HTML), and every link points back to this site.
export async function sendConfirmation(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const origin = new URL(request.url).origin;
  const from = request.headers.get('Origin');
  if (from && from !== origin) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return Response.json({ error: 'Email is not configured' }, { status: 503 });
  let d;
  try { d = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const str = (v, n) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '').slice(0, n).trim();
  const to = str(d.to, 120).toLowerCase();
  if (!/^[^\s@<>"]+@gatech\.edu$/.test(to)) return Response.json({ error: 'Recipient must be an @gatech.edu address' }, { status: 400 });
  const token = str(d.token, 40);
  if (!/^[a-z0-9]{8,40}$/.test(token)) return Response.json({ error: 'Invalid booking reference' }, { status: 400 });
  const f = { first: str(d.first, 60), room: str(d.room, 80), building: str(d.building, 80), floor: str(d.floor, 10),
    type: str(d.type, 60), capacity: str(d.capacity, 4), date: str(d.date, 60), time: str(d.time, 40) };
  if (!f.room || !f.date || !f.time) return Response.json({ error: 'Missing booking details' }, { status: 400 });
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const checkin = `${origin}/#checkin/${token}`, cancel = `${origin}/#cancel/${token}`;
  const subject = `Buzz Spot booking confirmed: ${f.room}, ${f.date}`;
  const row = (k, v) => v ? `<tr><td style="padding:3px 14px 3px 0;color:#5f6b76">${k}</td><td style="padding:3px 0">${esc(v)}</td></tr>` : '';
  const html = `<!doctype html><html><body style="margin:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#051e39;color:#f3eee3;padding:18px 24px;font-size:22px;font-family:Georgia,serif">BuzzSpot</td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 12px">Hi ${esc(f.first || 'there')},</p>
<p style="margin:0 0 16px">Your study room is booked. Here are the details:</p>
<table role="presentation" style="font-size:15px;margin:0 0 18px">${row('Room', f.room)}${row('Building', f.building + (f.floor ? ', floor ' + f.floor : ''))}${row('Date', f.date)}${row('Time', f.time)}${row('Room type', f.type + (f.capacity ? ' · up to ' + f.capacity + ' people' : ''))}</table>
<p style="margin:0 0 14px">When you arrive, open the link below and enter the code shown on the iPad outside the room to check in.</p>
<p style="margin:0 0 22px"><a href="${checkin}" style="display:inline-block;background:#b39051;color:#051e39;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px">Confirm and check in</a></p>
<p style="margin:0 0 6px"><b>Need to cancel?</b> <a href="${cancel}" style="color:#0b57d0">Cancel this reservation</a> so other students can use the room.</p>
<p style="margin:16px 0 0;font-size:12px;color:#5f6b76">You received this because a Buzz Spot booking was made with this email address.</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `Hi ${f.first || 'there'},\n\nYour study room is booked.\nRoom: ${f.room}\nBuilding: ${f.building}${f.floor ? ', floor ' + f.floor : ''}\nDate: ${f.date}\nTime: ${f.time}\n\nCheck in: ${checkin}\nCancel: ${cancel}\n`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, html, text }),
  });
  if (!res.ok) return Response.json({ error: 'The email service rejected the message' }, { status: 502 });
  return Response.json({ sent: true });
}
