#!/usr/bin/env python3
"""Download or verify only the pinned WISE2 AI Arsenal submodules."""
import argparse, json, pathlib, subprocess, sys

def run(*args):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE).stdout.strip()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Verify downloaded sources without network access")
    options = parser.parse_args()
    root = pathlib.Path(__file__).resolve().parents[2]
    manifest = json.loads((root / "WISE2-AI-ARSENAL/repositories.lock.json").read_text())
    for repo in manifest["repositories"]:
        path = root / repo["path"]
        if not options.check:
            run("git", "-C", str(root), "submodule", "update", "--init", "--depth", "1", "--", repo["path"])
        if not (path / ".git").exists():
            raise RuntimeError(f"Missing source: {repo['path']}; run without --check")
        actual = run("git", "-C", str(path), "rev-parse", "HEAD")
        if actual != repo["commit"]:
            raise RuntimeError(f"Wrong revision for {repo['id']}: {actual}")
        if not (path / "README.md").is_file():
            raise RuntimeError(f"Missing README for {repo['id']}")
        print(f"OK {repo['id']} {actual}")
    print("All six source checkouts match the lock file. Runtime installation is separate.")

if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
