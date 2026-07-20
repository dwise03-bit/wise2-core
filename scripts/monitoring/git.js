#!/usr/bin/env node

/**
 * Git Repository Monitoring Script
 * Collects metrics: branch, commits, status, last commit time
 */

const { execSync } = require('child_process');
const path = require('path');

// Repository root directory
const REPO_ROOT = path.resolve(__dirname, '../../');

class GitMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      type: 'git',
    };
  }

  /**
   * Execute git command safely
   */
  gitCommand(command) {
    try {
      return execSync(`cd ${REPO_ROOT} && git ${command}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
        .trim();
    } catch (error) {
      console.error(`Git command failed: ${command}`, error.message);
      return null;
    }
  }

  /**
   * Get current branch
   */
  getCurrentBranch() {
    return this.gitCommand('rev-parse --abbrev-ref HEAD');
  }

  /**
   * Get total commits
   */
  getTotalCommits() {
    try {
      return parseInt(this.gitCommand('rev-list --count HEAD') || '0', 10);
    } catch {
      return 0;
    }
  }

  /**
   * Get commits since last tag
   */
  getCommitsSinceTag() {
    try {
      const tagCount = this.gitCommand('tag --list | wc -l');
      if (!tagCount || parseInt(tagCount, 10) === 0) {
        return this.getTotalCommits();
      }
      return parseInt(
        this.gitCommand('rev-list --count $(git describe --tags --abbrev=0)..HEAD'),
        10,
      );
    } catch {
      return 0;
    }
  }

  /**
   * Get repository status (clean, dirty, etc.)
   */
  getStatus() {
    try {
      const status = this.gitCommand('status --porcelain');
      if (!status) return 'clean';

      const lines = status.split('\n').filter((l) => l.trim());
      const added = lines.filter((l) => l.startsWith('A')).length;
      const modified = lines.filter((l) => l.startsWith('M')).length;
      const deleted = lines.filter((l) => l.startsWith('D')).length;
      const untracked = lines.filter((l) => l.startsWith('??')).length;

      return {
        status: 'dirty',
        added,
        modified,
        deleted,
        untracked,
        total: lines.length,
      };
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get last commit info
   */
  getLastCommit() {
    try {
      const hash = this.gitCommand('rev-parse --short HEAD');
      const message = this.gitCommand('log -1 --pretty=%B');
      const author = this.gitCommand('log -1 --pretty=%an');
      const timestamp = this.gitCommand('log -1 --iso-strict-datetime --pretty=%aI');

      return {
        hash,
        message: message ? message.split('\n')[0] : '',
        author,
        timestamp,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get tracking status (ahead/behind of remote)
   */
  getTrackingStatus() {
    try {
      const branch = this.getCurrentBranch();
      const tracking = this.gitCommand(`rev-list --left-right --count ${branch}...@{u}`);
      if (!tracking) return { ahead: 0, behind: 0 };

      const [ahead, behind] = tracking.split('\t').map((n) => parseInt(n, 10));
      return { ahead, behind };
    } catch {
      return { ahead: 0, behind: 0 };
    }
  }

  /**
   * Collect all metrics
   */
  collect() {
    return {
      ...this.metrics,
      branch: this.getCurrentBranch(),
      totalCommits: this.getTotalCommits(),
      commitsSinceTag: this.getCommitsSinceTag(),
      status: this.getStatus(),
      lastCommit: this.getLastCommit(),
      tracking: this.getTrackingStatus(),
    };
  }
}

// Main execution
if (require.main === module) {
  const monitor = new GitMonitor();
  const metrics = monitor.collect();
  console.log(JSON.stringify(metrics, null, 2));
}

module.exports = { GitMonitor };
