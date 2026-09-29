const fs = require('fs');

const tsPath = 'packages/api/tsconfig.json';
const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
ts.exclude = Array.from(new Set([...(ts.exclude || []), 'src/cherry-count/**/*.ts']));
fs.writeFileSync(tsPath, JSON.stringify(ts, null, 2));

const appPath = 'packages/api/src/app.module.ts';
let src = fs.readFileSync(appPath, 'utf8');
src = src.replace(/import \{ CherryCountModule \} from '\.\/cherry-count\/cherry-count.module';\n?/, '');
src = src.replace(/\n\s*CherryCountModule,/, '');
fs.writeFileSync(appPath, src);
