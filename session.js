import { createHash, randomBytes } from 'node:crypto';
import { kv } from '@vercel/kv';

const maxAge = 8 * 60 * 60;
const cookieName = '__Host-mrp_session';
const usernamePattern = /^[a-z0-9_-]{3,20}$/;
const digest = value => createHash('sha256').update(value).digest('hex');
const sessionKey = token => 'mrp:session:' + digest(token);
const cookie = (value, age) => cookieName + '=' + value
  + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + age;

function readToken(request) {
  const token = (request.headers.cookie || '').match(/(?:^|;\s*)__Host-mrp_session=([0-9a-f]{64})(?:;|$)/)?.[1];
  return token || null;
}

export async function startSession(response, username, user) {
  const token = randomBytes(32).toString('hex');
  await kv.set(sessionKey(token), {
    username,
    credential: digest(JSON.stringify([user.password, user.createdAt]))
  }, { ex: maxAge });
  response.setHeader('Set-Cookie', cookie(token, maxAge));
}

export async function endSession(request, response) {
  const token = readToken(request);
  if (token) await kv.del(sessionKey(token));
  response.setHeader('Set-Cookie', cookie('', 0));
}

export async function requireSession(request, response, users) {
  response.setHeader('Cache-Control', 'no-store');
  const token = readToken(request);
  const session = token && await kv.get(sessionKey(token));
  if (session && usernamePattern.test(session.username)) {
    const accounts = users ?? await kv.get('app_users');
    const user = accounts && Object.hasOwn(accounts, session.username) && accounts[session.username];
    if (user && session.credential === digest(JSON.stringify([user.password, user.createdAt]))) {
      return { username: session.username, role: user.role || (session.username === 'krisandi' ? 'admin' : 'user') };
    }
  }
  response.status(401).json({ success: false, message: 'Sesi berakhir. Silakan masuk kembali.' });
  return null;
}

export function isDocumentNumber(number, type) {
  return typeof number === 'string' && number.startsWith(type + '-') && number.length > type.length + 1;
}
