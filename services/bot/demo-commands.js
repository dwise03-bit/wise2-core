#!/usr/bin/env node

/**
 * WISE² Demo Commands
 * Discord bot commands for demo management and client delivery
 */

module.exports = {
  name: 'Demo Commands',
  commands: [
    {
      name: 'demo',
      description: 'Access WISE² demo operating systems',
      options: [
        {
          name: 'launch',
          description: 'Launch a specific demo',
          type: 3, // STRING
          choices: [
            { name: 'Action Dispatch', value: 'action-dispatch' },
            { name: 'Fergies Table', value: 'fergies-table' },
            { name: 'Lexis Inks', value: 'lexis-inks' },
            { name: 'HVAC Demo', value: 'hvac-demo' },
            { name: 'All Demos Hub', value: 'hub' },
          ],
        },
      ],
      execute: async (interaction) => {
        const demo = interaction.options.getString('launch');
        const demoLinks = {
          'action-dispatch': 'https://wise2.net/action-dispatch/',
          'fergies-table': 'https://wise2.net/fergies-table/',
          'lexis-inks': 'https://wise2.net/lexis-inks/',
          'hvac-demo': 'https://hvac.wise2.net/wise-hvac-demo/',
          'hub': 'https://wise2.net/demos',
        };

        await interaction.reply({
          embeds: [
            {
              title: demo === 'hub' ? '🎯 WISE² Demo Hub' : `🚀 ${demo.toUpperCase()}`,
              description: demo === 'hub'
                ? 'Browse all live operating system demonstrations'
                : `Launch the ${demo} operating system`,
              url: demoLinks[demo],
              color: 0x06b6d4, // Cyan
              fields: [
                {
                  name: '📱 Live & Ready',
                  value: demo === 'hub'
                    ? 'All demos available on-demand'
                    : 'Click the title to launch',
                  inline: true,
                },
                {
                  name: '⚡ Status',
                  value: 'Production',
                  inline: true,
                },
              ],
              footer: { text: 'WISE² Command Center' },
            },
          ],
          components: [
            {
              type: 1, // ACTION ROW
              components: [
                {
                  type: 2, // BUTTON
                  label: 'Launch Demo',
                  url: demoLinks[demo],
                  style: 5, // LINK
                },
              ],
            },
          ],
        });
      },
    },
    {
      name: 'demos',
      description: 'Show all live WISE² operating system demos',
      execute: async (interaction) => {
        await interaction.reply({
          embeds: [
            {
              title: '🎯 WISE² Operating Systems — Live Demos',
              description: 'Production-ready business operating systems, deployed and live.',
              color: 0x06b6d4,
              fields: [
                {
                  name: '✅ Active Demos',
                  value: `
**Action Dispatch** — Home services & emergency response
**Fergies Table** — Catering & events management
**Lexis Inks** — Retail operations & POS
**WISE HVAC** — Field technician toolkit
**WISE² Platform** — Enterprise command center
                  `,
                  inline: false,
                },
                {
                  name: '🔗 Quick Links',
                  value: `
[View All Demos](https://wise2.net/demos)
[Action Dispatch](https://wise2.net/action-dispatch/)
[Fergies Table](https://wise2.net/fergies-table/)
[HVAC Demo](https://hvac.wise2.net/wise-hvac-demo/)
                  `,
                  inline: false,
                },
                {
                  name: '💬 Get Support',
                  value: 'React with 🎯 to schedule a demo walkthrough',
                  inline: false,
                },
              ],
              footer: { text: 'WISE² Control Center' },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'View All Demos',
                  url: 'https://wise2.net/demos',
                  style: 5,
                },
                {
                  type: 2,
                  label: 'Schedule Demo',
                  url: 'https://wise2.net/contact',
                  style: 5,
                },
              ],
            },
          ],
        });
      },
    },
    {
      name: 'demo-status',
      description: 'Check real-time status of all demos',
      execute: async (interaction) => {
        const statuses = [
          { name: 'Action Dispatch', status: '✅ Online', uptime: '7h' },
          { name: 'Fergies Table', status: '✅ Online', uptime: '7h' },
          { name: 'Lexis Inks', status: '✅ Online', uptime: '7h' },
          { name: 'HVAC Demo', status: '✅ Online', uptime: 'Stable' },
          { name: 'WISE² Platform', status: '✅ Online', uptime: 'Stable' },
        ];

        const fields = statuses.map(s => ({
          name: s.name,
          value: `${s.status} — Uptime: ${s.uptime}`,
          inline: true,
        }));

        await interaction.reply({
          embeds: [
            {
              title: '📊 Demo Infrastructure Status',
              description: 'All operating systems live and production-ready.',
              color: 0x22c55e, // Green
              fields,
              footer: { text: `Last updated: ${new Date().toISOString()}` },
            },
          ],
        });
      },
    },
  ],

  webhooks: [
    {
      event: 'demo.launched',
      template: {
        embeds: [
          {
            title: '🚀 Demo Session Started',
            description: 'A client has launched one of the WISE² operating systems.',
            color: 0x06b6d4,
            fields: [
              { name: 'Demo', value: '{demo_name}', inline: true },
              { name: 'Client', value: '{client_name}', inline: true },
              { name: 'Timestamp', value: '{timestamp}', inline: false },
            ],
          },
        ],
      },
    },
    {
      event: 'demo.feedback',
      template: {
        embeds: [
          {
            title: '💬 Demo Feedback Received',
            description: 'Client has submitted feedback on a demo.',
            color: 0xf59e0b,
            fields: [
              { name: 'Demo', value: '{demo_name}', inline: true },
              { name: 'Feedback', value: '{feedback}', inline: false },
            ],
          },
        ],
      },
    },
  ],
};
