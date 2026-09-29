export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'operator' | 'user'
}

export interface Stat {
  label: string
  value: string | number
  change?: number
  status?: 'good' | 'warning' | 'critical'
}

export interface SystemStatus {
  online: boolean
  uptime: number
  cpu: number
  memory: number
  disk: number
  temperature?: number
}

export interface Deployment {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  service: string
  uptime: number
  cpu: number
  memory: number
  restarts: number
}

export interface AIModel {
  id: string
  name: string
  status: 'online' | 'offline'
  latency: number
  tokens_used: number
  cost: number
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dueDate?: Date
}

export interface ServerMetrics {
  timestamp: number
  cpu: number
  memory: number
  disk: number
  network: {
    in: number
    out: number
  }
  processes: number
  temperature?: number
}

export interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  badge?: number
  children?: NavItem[]
}
