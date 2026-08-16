# Wise² Core Documentation

Complete documentation for Wise² Core infrastructure, services, and operations.

## Quick Links

### For Everyone
- [Architecture Overview](../MASTER.md) — System design and components
- [Project Status](../CURRENT_STATE.md) — Current project state
- [Roadmap](../ROADMAP.md) — Development timeline and phases
- [Decisions Log](../DECISIONS.md) — Architectural decisions
- [Project Index](../PROJECT_INDEX.md) — Complete component catalog

### For Developers
- [Getting Started](guides/getting-started.md) — Development environment setup
- [Development Guide](guides/development-setup.md) — Development workflow
- [API Documentation](API.md) — API endpoints and integration
- [Architecture Deep Dive](ARCHITECTURE.md) — Detailed architecture

### For Operators
- [Operations Guide](guides/operations-guide.md) — System administration
- [Deployment](runbooks/deployment.md) — Deployment procedures
- [Configuration](CONFIGURATION.md) — Service configuration
- [Maintenance](runbooks/maintenance.md) — Maintenance tasks
- [Troubleshooting](runbooks/troubleshooting.md) — Problem resolution
- [Disaster Recovery](runbooks/disaster-recovery.md) — Recovery procedures

### For Raspberry Pi
- [Pi Setup Guide](../raspberry-pi/README.md) — Raspberry Pi configuration

## Documentation Structure

```
docs/
├── README.md (this file)
├── ARCHITECTURE.md — Detailed system architecture
├── API.md — API documentation
├── CONFIGURATION.md — Configuration guide
│
├── runbooks/ — Operational procedures
│   ├── deployment.md — Deployment process
│   ├── maintenance.md — Maintenance tasks
│   ├── disaster-recovery.md — Recovery procedures
│   └── troubleshooting.md — Problem solving
│
└── guides/ — Getting started and how-tos
    ├── getting-started.md — Quick start guide
    ├── development-setup.md — Dev environment
    └── operations-guide.md — Operations manual
```

## Key Topics

### System Architecture
- **Centralized Orchestration**: Raspberry Pi as primary orchestrator
- **Docker Services**: All services containerized and orchestrated
- **Scalable Design**: Built for growth with modular architecture
- **AI-Powered**: Integrated Claude API and local Ollama models

### Components
- **Database**: PostgreSQL for primary data storage
- **Cache**: Redis for sessions and fast data access
- **Messaging**: Redis Streams for event processing (upgrade path to RabbitMQ)
- **Monitoring**: Prometheus + Grafana for observability
- **AI Services**: Claude API integration + Ollama local inference

### Operations
- **Infrastructure as Code**: All infrastructure defined in Git
- **Automated Deployment**: CI/CD pipeline via GitHub Actions
- **Monitoring**: Real-time metrics and alerting
- **Backup**: Automated backup and disaster recovery
- **Security**: Secret management, access control, audit logs

## Getting Help

### Common Questions
- **"How do I set up my development environment?"** → See [getting-started.md](guides/getting-started.md)
- **"How do I deploy a change?"** → See [deployment.md](runbooks/deployment.md)
- **"Something is broken, what do I do?"** → See [troubleshooting.md](runbooks/troubleshooting.md)
- **"How does the system architecture work?"** → See [MASTER.md](../MASTER.md)

### Contributing
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- Review [Decisions](../DECISIONS.md) to understand "why"
- Follow the development guides in [guides/](guides/)
- Update documentation when making changes

### Reporting Issues
- Document the issue clearly
- Include logs and context
- Reference relevant documentation
- Create GitHub issue with details

## Key Principles

### Documentation First
- Every feature is documented before implementation
- Changes include documentation updates
- Runbooks guide operational tasks
- Architecture decisions are explained

### Single Source of Truth
- GitHub is authoritative
- Documentation lives in repository
- All procedures are version-controlled
- History is preserved and searchable

### Accessibility
- Documentation is written for team members at all levels
- Complex concepts are explained with examples
- Diagrams supplement text
- Links connect related information

## Version Information

**Documentation Version**: 1.0
**Last Updated**: 2026-07-07
**Maintained By**: CTO / Lead Systems Engineer

---

**Next Steps**: Start with [MASTER.md](../MASTER.md) for architecture overview, or [guides/getting-started.md](guides/getting-started.md) for hands-on setup.
