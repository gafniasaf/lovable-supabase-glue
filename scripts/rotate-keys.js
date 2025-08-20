#!/usr/bin/env node
const { generateKeyPairSync } = require('crypto');

function main() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  const b64pub = Buffer.from(publicKey).toString('base64');
  const b64priv = Buffer.from(privateKey).toString('base64');
  const kid = `kid-${Date.now()}`;
  console.log('# Copy the following into your envs');
  console.log(`NEXT_RUNTIME_PUBLIC_KEY=${b64pub}`);
  console.log(`NEXT_RUNTIME_PRIVATE_KEY=${b64priv}`);
  console.log(`NEXT_RUNTIME_KEY_ID=${kid}`);
}

main();


