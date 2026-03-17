#!/usr/bin/env node
'use strict';

const readline = require('readline');

const PAYLOAD_URL = 'http://localhost:3000';

function prompt(question, silent = false) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: silent ? null : process.stdout,
      terminal: true,
    });
    if (silent) {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      let input = '';
      process.stdin.on('data', function handler(char) {
        if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handler);
          process.stdout.write('\n');
          rl.close();
          resolve(input);
        } else if (char === '\u0003') {
          process.exit();
        } else if (char === '\u007f') {
          if (input.length > 0) input = input.slice(0, -1);
        } else {
          input += char;
        }
      });
    } else {
      rl.question(question, answer => { rl.close(); resolve(answer); });
    }
  });
}

async function login(email, password) {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login fehlgeschlagen (${res.status})`);
  const data = await res.json();
  return data.token;
}

async function setGlobal(slug, data, token) {
  const res = await fetch(`${PAYLOAD_URL}/api/globals/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Global "${slug}" fehlgeschlagen (${res.status}): ${err.slice(0, 200)}`);
  }
  return res.json();
}

const PRIVACY_CONTENT = `This Privacy Policy describes how your personal information is collected, used, and shared when you visit Bedcave.

## Information We Collect

When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.

## How We Use Your Information

We use the information we collect to:

- Operate and maintain the website
- Understand and analyze how you use our website
- Improve our website and user experience

## Data Retention

We will retain your information for our records unless and until you ask us to delete this information.

## Changes

We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal or regulatory reasons.

## Contact Us

For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us.`;

const LEGAL_CONTENT = `## Information pursuant to § 5 TMG

Bedcave
[Your Name]
[Your Street Address]
[Your City, Postal Code]
Germany

## Contact

Email: contact@bedcave.com
Website: https://bedcave.com

## Disclaimer

### Liability for Content

As a service provider, we are responsible for our own content on these pages in accordance with § 7 para.1 TMG (German Telemedia Act) and general laws. However, according to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.

### Liability for Links

Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages.

### Copyright

The content and works created by the site operators on these pages are subject to German copyright law. The duplication, processing, distribution, and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.`;

async function main() {
  console.log('\n🌱 Payload Globals — Seed Script\n');

  const email    = await prompt('📧 Email:    ');
  const password = await prompt('🔑 Passwort: ', true);

  console.log('\n🔐 Anmelden...');
  const token = await login(email, password);
  console.log('✓ Eingeloggt\n');

  console.log('📝 Seeding Privacy Policy...');
  await setGlobal('privacy', {
    title: 'Privacy Policy',
    content: PRIVACY_CONTENT,
    lastUpdated: 'March 2026',
  }, token);
  console.log('✓ Privacy Policy gesetzt\n');

  console.log('⚖️  Seeding Legal Notice...');
  await setGlobal('legal', {
    title: 'Legal Notice / Imprint',
    content: LEGAL_CONTENT,
    lastUpdated: 'March 2026',
  }, token);
  console.log('✓ Legal Notice gesetzt\n');

  console.log('🎉 Globals erfolgreich gesetzt!');
  console.log('   → Im Admin unter /admin unter "Globals" editierbar.');
}

main().catch(err => {
  console.error('\n❌ Abgebrochen:', err.message);
  process.exit(1);
});
