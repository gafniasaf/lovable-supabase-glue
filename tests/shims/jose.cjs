// Minimal CommonJS shim for jose in Jest to avoid ESM transform issues
function base64urlDecode(input) {
  const pad = input.length % 4 === 2 ? '==' : input.length % 4 === 3 ? '=' : '';
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64').toString('utf8');
}

async function jwtVerify(token, _key, _opts) {
  if (!token || typeof token !== 'string' || token.split('.').length < 3) {
    throw new Error('invalid token');
  }
  const parts = token.split('.');
  let header = {};
  try {
    const headerJson = base64urlDecode(parts[0]);
    header = JSON.parse(headerJson);
    const payloadJson = base64urlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    // Minimal HS256 signature check when key is provided (Uint8Array or Buffer)
    if ((header.alg === 'HS256') && _key) {
      const crypto = require('crypto');
      const keyBuf = Buffer.isBuffer(_key) ? _key : (typeof _key === 'string' ? Buffer.from(_key) : Buffer.from(_key.buffer || _key));
      const data = parts[0] + '.' + parts[1];
      const sig = crypto.createHmac('sha256', keyBuf).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
      if (sig !== parts[2]) throw new Error('invalid signature');
    }
    return { payload };
  } catch (e) {
    throw new Error('invalid token');
  }
}

class SignJWT {
  constructor(payload) { this._payload = payload || {}; this._header = {}; }
  setProtectedHeader(header) { this._header = header || {}; return this; }
  async sign(_key) {
    const header = { alg: this._header.alg || 'HS256', typ: this._header.typ || 'JWT' };
    const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const head = enc(header);
    const payload = enc(this._payload || {});
    const data = `${head}.${payload}`;
    if (header.alg === 'HS256') {
      const crypto = require('crypto');
      const keyBuf = Buffer.isBuffer(_key) ? _key : (typeof _key === 'string' ? Buffer.from(_key) : Buffer.from(_key.buffer || _key));
      const sig = crypto.createHmac('sha256', keyBuf).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
      return `${data}.${sig}`;
    }
    return `${data}.sig`;
  }
}

async function importSPKI(_spki, _alg) { return {}; }
async function importPKCS8(_pkcs8, _alg) { return {}; }

module.exports = { jwtVerify, SignJWT, importSPKI, importPKCS8 };


