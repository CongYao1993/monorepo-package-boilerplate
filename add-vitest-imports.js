/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('packages/**/*.test.{ts,tsx}').concat(glob.sync('scripts/templates/**/*.test.{ts,tsx}'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes("from 'vitest'") && !content.includes('from "vitest"')) {
    fs.writeFileSync(f, "import { describe, it, expect } from 'vitest'\n" + content);
    console.log('Updated ' + f);
  }
});
