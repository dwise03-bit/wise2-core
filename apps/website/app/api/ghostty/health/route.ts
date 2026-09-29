import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Query Ghostty daemon on VPS
    const ghosttyResponse = await fetch('http://173.208.147.165:3033/health', {
      timeout: 5000,
    }).catch(() => null)

    if (!ghosttyResponse?.ok) {
      return NextResponse.json({
        status: 'offline',
        metrics: {
          uptime: '0h 0m',
          tasks: 0,
          activeConnections: 0,
          cpuUsage: 0,
        },
      })
    }

    const data = await ghosttyResponse.json()

    return NextResponse.json({
      status: 'online',
      metrics: {
        uptime: data.uptime || '0h 0m',
        tasks: data.tasks || 0,
        activeConnections: data.connections || 0,
        cpuUsage: data.cpu || 0,
      },
      lastCheck: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
