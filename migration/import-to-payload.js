#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PAYLOAD_URL = 'http://localhost:3000';
// postsData wird in main() geladen, damit require() keine Seiteneffekte hat

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wartet darauf dass der Payload-Server antwortet.
 * Payload 3.x hat keinen /api/health — GET /api/users gibt 401 zurück wenn der Server läuft.
 */
async function waitForServer() {
  const maxRetries = 30;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/users`);
      if (res.status === 401 || res.ok) {
        console.log('✓ Server bereit');
        return;
      }
    } catch (_) {
      // Connection refused — Server noch nicht da
    }
    console.log(`Warte auf Server... (${i}/${maxRetries})`);
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server nicht erreichbar nach 30 Versuchen');
}

/**
 * Fragt eine Zeile interaktiv ab. Für das Passwort wird kein Echo angezeigt.
 */
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
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

/**
 * Konvertiert einen Markdown-String in ein minimales Lexical-JSON-Dokument.
 * Der gesamte Text wird als einzelner Paragraph-Node eingewickelt.
 */
function markdownToLexical(markdown) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              version: 1,
              text: markdown || '',
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
            },
          ],
        },
      ],
    },
  };
}

/**
 * Truncated excerpt auf maximal 500 Zeichen (BlogPosts maxLength: 500).
 */
function truncateExcerpt(text) {
  if (!text) return '';
  return text.length > 500 ? text.slice(0, 497) + '...' : text;
}

/**
 * Normalisiert ein Date-Only-String ("2026-03-15") zu ISO 8601 datetime.
 */
function toISODateTime(dateString) {
  if (!dateString) return new Date().toISOString();
  return new Date(dateString).toISOString();
}

module.exports = { waitForServer, prompt, markdownToLexical, truncateExcerpt, toISODateTime };
