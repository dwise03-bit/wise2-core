#!/usr/bin/env python3
"""Download pinned sources, verify them, or search their resource catalogs."""
import argparse
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]

def run(*args):
    return subprocess.check_output(args, text=True).strip()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--search', help='Case-insensitive text in the three catalogs')
    parser.add_argument('--limit', type=int, default=20)
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'WISE2-DEV-ARSENAL/repositories.lock.json').read_text())
    matches = 0
    for repo in manifest['repositories']:
        path = ROOT / repo['path']
        if not args.check and args.search is None:
            subprocess.run(['git', '-C', str(ROOT), 'submodule', 'update', '--init', '--depth', '1', '--', repo['path']], check=True)
        if not (path / '.git').exists():
            raise RuntimeError(f"Missing source: {repo['id']}; run this script without options first")
        if run('git', '-C', str(path), 'rev-parse', 'HEAD') != repo['commit']:
            raise RuntimeError(f"Wrong revision: {repo['id']}")
        readme = path / repo['readme']
        if not readme.is_file():
            raise RuntimeError(f"Missing README: {repo['id']}")
        if args.search is None:
            print(f"OK {repo['id']} {repo['commit']}")
        elif repo['kind'] == 'catalog':
            for number, line in enumerate(readme.read_text(encoding='utf-8').splitlines(), 1):
                if args.search.casefold() in line.casefold() and matches < args.limit:
                    print(f"{repo['path']}/{repo['readme']}:{number}: {line}")
                    matches += 1
    if args.search is None:
        print('All five source checkouts verified. Application installation is separate.')
    elif not matches:
        print('No catalog matches.')

if __name__ == '__main__':
    main()
