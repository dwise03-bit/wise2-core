import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { execSync } from 'child_process';

interface BotAction {
  action: 'start' | 'stop' | 'restart' | 'status';
  botId?: number | string;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as BotAction;
    const { action, botId } = body;

    if (!action || !['start', 'stop', 'restart', 'status'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let command = '';
    let result = {};

    try {
      switch (action) {
        case 'start':
          if (botId !== undefined) {
            command = `pm2 start ${botId} --no-autosave`;
          } else {
            command = 'pm2 start ecosystem.config.js --no-autosave';
          }
          execSync(command, { stdio: 'ignore' });
          result = { success: true, message: 'Bot(s) started' };
          break;

        case 'stop':
          if (botId !== undefined) {
            command = `pm2 stop ${botId} --no-autosave`;
          } else {
            command = 'pm2 stop all --no-autosave';
          }
          execSync(command, { stdio: 'ignore' });
          result = { success: true, message: 'Bot(s) stopped' };
          break;

        case 'restart':
          if (botId !== undefined) {
            command = `pm2 restart ${botId} --no-autosave`;
          } else {
            command = 'pm2 restart all --no-autosave';
          }
          execSync(command, { stdio: 'ignore' });
          result = { success: true, message: 'Bot(s) restarted' };
          break;

        case 'status':
          try {
            const output = execSync('pm2 list --format json --no-autosave', {
              encoding: 'utf-8',
            });
            const processes = JSON.parse(output);
            result = {
              success: true,
              bots: processes.map((p: any) => ({
                id: p.pm2_env.pm_id,
                name: p.name,
                status: p.pm2_env.status,
                pid: p.pid || null,
                memory: Math.round(p.monit.memory / 1024 / 1024),
                uptime: p.pm2_env.pm_uptime,
                restarts: p.pm2_env.restart_time,
              })),
            };
          } catch (error) {
            result = {
              success: false,
              error: 'Failed to get PM2 status',
            };
          }
          break;
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Bot control error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const output = execSync('pm2 list --format json --no-autosave', {
        encoding: 'utf-8',
      });
      const processes = JSON.parse(output);

      const bots = processes.map((p: any) => ({
        id: p.pm2_env.pm_id,
        name: p.name,
        status: p.pm2_env.status,
        pid: p.pid || null,
        memory: Math.round(p.monit.memory / 1024 / 1024),
        cpu: Math.round(p.monit.cpu || 0),
        uptime: p.pm2_env.pm_uptime,
        restarts: p.pm2_env.restart_time,
      }));

      const summary = {
        total: bots.length,
        online: bots.filter((b: any) => b.status === 'online').length,
        errored: bots.filter((b: any) => b.status === 'errored').length,
        stopped: bots.filter((b: any) => b.status === 'stopped').length,
      };

      return NextResponse.json({ success: true, bots, summary }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve bot status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Bot status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
