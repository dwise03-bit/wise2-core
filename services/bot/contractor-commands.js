/**
 * WISE² Contractor OS Discord Commands
 * Slash commands for Contractor OS product
 * Integrated with existing WISE² Discord bot
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Command definitions
const commands = [
  new SlashCommandBuilder()
    .setName('contractor')
    .setDescription('🚀 View WISE² Contractor OS — CRM, jobs, estimates, crews, and AI in one system')
    .addStringOption((option) =>
      option
        .setName('section')
        .setDescription('Which section to view')
        .setRequired(false)
        .addChoices(
          { name: 'Overview', value: 'overview' },
          { name: 'Features', value: 'features' },
          { name: 'Trades', value: 'trades' },
          { name: 'Pricing', value: 'pricing' },
          { name: 'Demo', value: 'demo' }
        )
    ),

  new SlashCommandBuilder()
    .setName('contractor-features')
    .setDescription('📊 View Contractor OS features in detail'),

  new SlashCommandBuilder()
    .setName('contractor-demo')
    .setDescription('🎬 Request a demo of Contractor OS'),

  new SlashCommandBuilder()
    .setName('contractor-help')
    .setDescription('❓ Get help with Contractor OS'),

  new SlashCommandBuilder()
    .setName('contractor-pricing')
    .setDescription('💰 View Contractor OS pricing plans'),

  new SlashCommandBuilder()
    .setName('contractor-trades')
    .setDescription('🏗️ See which trades are supported'),

  new SlashCommandBuilder()
    .setName('contractor-integrations')
    .setDescription('🔗 View built-in integrations'),

  new SlashCommandBuilder()
    .setName('contractor-testimonials')
    .setDescription('⭐ Read customer success stories'),

  new SlashCommandBuilder()
    .setName('contractor-roadmap')
    .setDescription('🗺️ What\'s coming next in Contractor OS'),

  new SlashCommandBuilder()
    .setName('contractor-faq')
    .setDescription('❔ Common questions about Contractor OS'),

  new SlashCommandBuilder()
    .setName('contractor-docs')
    .setDescription('📚 View documentation & guides'),

  new SlashCommandBuilder()
    .setName('contractor-compare')
    .setDescription('⚖️ Compare Contractor OS vs other solutions'),

  new SlashCommandBuilder()
    .setName('contractor-contact')
    .setDescription('📞 Contact sales or support team'),

  new SlashCommandBuilder()
    .setName('academy')
    .setDescription('🎓 WISE² Academy — Training for Contractor OS mastery'),

  new SlashCommandBuilder()
    .setName('academy-courses')
    .setDescription('📚 Browse WISE² Academy courses'),

  new SlashCommandBuilder()
    .setName('academy-certification')
    .setDescription('🏆 Get Contractor OS Certified'),

  new SlashCommandBuilder()
    .setName('academy-enroll')
    .setDescription('✍️ Enroll in a course'),

  new SlashCommandBuilder()
    .setName('academy-schedule')
    .setDescription('📅 View class schedules & live training'),

  new SlashCommandBuilder()
    .setName('academy-resources')
    .setDescription('📖 Access learning materials & templates'),

  new SlashCommandBuilder()
    .setName('academy-instructors')
    .setDescription('👨‍🏫 Meet the WISE² Academy team'),
];

// Handler functions
const handlers = {
  async contractor(interaction) {
    const section = interaction.options.getString('section') || 'overview';
    const sectionUrls = {
      overview: 'https://wise2.net/contractor',
      features: 'https://wise2.net/contractor#features',
      trades: 'https://wise2.net/contractor#trades',
      pricing: 'https://wise2.net/contractor#pricing',
      demo: 'https://wise2.net/contractor#demo',
    };

    const url = sectionUrls[section] || sectionUrls.overview;

    const embed = new EmbedBuilder()
      .setTitle('🚀 WISE² Contractor OS')
      .setDescription('One login. One system. Total control.')
      .setColor(0xf2b632) // WISE² gold
      .setURL(url)
      .addFields(
        {
          name: '📍 Section',
          value: section.charAt(0).toUpperCase() + section.slice(1),
          inline: true,
        },
        {
          name: '🔗 View Page',
          value: `[Open ${section.charAt(0).toUpperCase() + section.slice(1)} →](${url})`,
          inline: true,
        }
      )
      .setFooter({ text: 'WISE² Contractor OS v1.0' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Contractor OS')
        .setURL(url)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorFeatures(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📊 Contractor OS Features')
      .setDescription('Everything you need to run your business')
      .setColor(0xf2b632)
      .setURL('https://wise2.net/contractor#features')
      .addFields(
        {
          name: '💼 CRM & Leads',
          value: 'Capture, track, and follow up on every lead automatically',
          inline: true,
        },
        {
          name: '📋 Jobs & Dispatch',
          value: 'Schedule crews and track progress in real-time',
          inline: true,
        },
        {
          name: '📑 Estimates',
          value: 'Professional proposals with e-signatures',
          inline: true,
        },
        {
          name: '💰 Invoices & Payments',
          value: 'Send, automate, and collect payments',
          inline: true,
        },
        {
          name: '💬 Team Chat',
          value: 'Built-in messaging for instant crew coordination',
          inline: true,
        },
        {
          name: '🤖 AI Operator',
          value: 'Ask anything and get business recommendations',
          inline: true,
        },
        {
          name: '⛈️ Storm Intel',
          value: 'Detect job opportunities before competitors',
          inline: true,
        },
        {
          name: '⚡ Automation',
          value: 'Workflows, triggers, and AI actions',
          inline: true,
        }
      )
      .setFooter({ text: 'Replaces 7+ separate apps' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Full Features')
        .setURL('https://wise2.net/contractor#features')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorDemo(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📅 Schedule a Demo')
      .setDescription('Ready to see Contractor OS in action?')
      .setColor(0x22c55e) // Green
      .setURL('https://wise2.net/contractor#demo')
      .addFields(
        {
          name: '🎯 Demo Includes',
          value:
            '• Live product walkthrough\n' +
            '• Industry-specific setup\n' +
            '• Integration possibilities\n' +
            '• Pricing & plans Q&A',
        },
        {
          name: '⏱️ Duration',
          value: '30 minutes (no pressure, no sales call)',
        }
      )
      .setFooter({ text: 'WISE² Contractor OS' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Schedule Demo')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Learn More')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorHelp(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('❓ Contractor OS Help')
      .setDescription('Common questions and getting started')
      .setColor(0x3b82f6) // Blue
      .addFields(
        {
          name: '🚀 Getting Started',
          value: '[View the Contractor OS →](https://wise2.net/contractor)',
        },
        {
          name: '📚 Documentation',
          value: '[Browse guides & tutorials →](https://wise2.net/docs)',
        },
        {
          name: '📞 Need Support?',
          value: 'Reply to this message or visit wise2.net/support',
        },
        {
          name: '🏗️ For Which Trades?',
          value:
            'HVAC • Roofing • Pressure Washing • Construction • Plumbing • Electrical • Landscaping • Pest Control • Painting • Detailing',
          inline: false,
        }
      )
      .setFooter({ text: 'More help at https://wise2.net' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Contractor OS')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Request Demo')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorPricing(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('💰 Contractor OS Pricing')
      .setDescription('Flexible plans for businesses of all sizes')
      .setColor(0xf2b632) // Gold
      .setURL('https://wise2.net/contractor#pricing')
      .addFields(
        {
          name: '🚀 Starter',
          value: 'Perfect for growing teams — CRM, Jobs, Estimates',
          inline: true,
        },
        {
          name: '⭐ Professional',
          value: 'Most popular — Everything + Invoicing & Payments',
          inline: true,
        },
        {
          name: '🏆 Enterprise',
          value: 'Custom setup — Full platform + dedicated support',
          inline: true,
        },
        {
          name: '✨ Special Offer',
          value: '30-day free trial • No credit card required • Full feature access',
          inline: false,
        }
      )
      .setFooter({ text: 'All plans include AI Operator and Storm Intel' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Pricing')
        .setURL('https://wise2.net/contractor#pricing')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Start Free Trial')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorTrades(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🏗️ Supported Trades')
      .setDescription('Contractor OS works for service & trade businesses')
      .setColor(0x06b6d4) // Cyan
      .setURL('https://wise2.net/contractor#trades')
      .addFields(
        {
          name: 'Home Services',
          value: 'HVAC • Plumbing • Electrical • Roofing',
          inline: false,
        },
        {
          name: 'Exterior Services',
          value: 'Pressure Washing • Landscaping • Tree Service • Painting',
          inline: false,
        },
        {
          name: 'Specialized Services',
          value: 'Pest Control • Pool Service • Detailing • Construction',
          inline: false,
        },
        {
          name: '✨ And More',
          value: 'Any service or trade business can benefit from Contractor OS',
          inline: false,
        }
      )
      .setFooter({ text: 'Industry-specific templates included' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View All Trades')
        .setURL('https://wise2.net/contractor#trades')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorIntegrations(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🔗 Built-in Integrations')
      .setDescription('Connect with your favorite business tools')
      .setColor(0x8b5cf6) // Purple
      .setURL('https://wise2.net/contractor')
      .addFields(
        {
          name: '💳 Payments & Accounting',
          value: 'Stripe • Square • QuickBooks • FreshBooks',
          inline: false,
        },
        {
          name: '📅 Scheduling & Dispatch',
          value: 'ServiceTitan • Jobber • Housecall Pro',
          inline: false,
        },
        {
          name: '💬 Communication',
          value: 'Slack • Twilio • Discord • Email',
          inline: false,
        },
        {
          name: '🗂️ Data & Storage',
          value: 'Google Drive • Dropbox • Zapier',
          inline: false,
        }
      )
      .setFooter({ text: 'More integrations coming soon' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Learn More')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorTestimonials(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('⭐ Customer Success Stories')
      .setDescription('See how contractors are using Contractor OS')
      .setColor(0xfbbf24) // Amber
      .addFields(
        {
          name: '📈 Results',
          value:
            '• 40% more jobs closed\n' +
            '• 5+ hours saved per week\n' +
            '• 3x faster follow-ups\n' +
            '• Happier, more organized teams',
          inline: false,
        },
        {
          name: '💬 What Contractors Say',
          value:
            '"Contractor OS replaced 7 different tools and actually works better than each one individually."\n\n' +
            '"The AI Operator is like having a business manager in your pocket."',
          inline: false,
        }
      )
      .setFooter({ text: 'Join 1000+ successful contractors' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Read Full Stories')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Schedule Demo')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorRoadmap(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🗺️ Product Roadmap')
      .setDescription('What\'s coming to Contractor OS')
      .setColor(0x10b981) // Emerald
      .addFields(
        {
          name: '✅ Now Available',
          value: 'CRM • Jobs • Estimates • Invoicing • AI Operator • Storm Intel',
          inline: false,
        },
        {
          name: '🔄 Q3 2026',
          value: 'Advanced analytics • Custom workflows • Team training portal',
          inline: false,
        },
        {
          name: '🎯 Q4 2026',
          value: 'Mobile app (iOS/Android) • Field crew app • Advanced reporting',
          inline: false,
        },
        {
          name: '⚡ Future',
          value: 'AR job site walkthroughs • Predictive pricing • Multi-location management',
          inline: false,
        }
      )
      .setFooter({ text: 'Features based on contractor feedback' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Full Roadmap')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorFaq(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('❔ Frequently Asked Questions')
      .setDescription('Common questions about Contractor OS')
      .setColor(0x06b6d4) // Cyan
      .addFields(
        {
          name: '⏱️ How long does setup take?',
          value: '15 minutes. We handle everything for you.',
        },
        {
          name: '💵 Do you offer a free trial?',
          value: 'Yes! 30-day free trial with full access.',
        },
        {
          name: '🔄 Can I import my existing data?',
          value: 'Yes. We help migrate from your current system.',
        },
        {
          name: '📱 Is there a mobile app?',
          value: 'iOS and Android apps launching Q4 2026.',
        },
        {
          name: '🆘 What if I need help?',
          value: 'Email support, phone support, and live chat available.',
        }
      )
      .setFooter({ text: 'Have another question? Contact our team' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('More FAQs')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Contact Support')
        .setURL('https://wise2.net/contractor#contact')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorDocs(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📚 Documentation & Guides')
      .setDescription('Learn how to use Contractor OS')
      .setColor(0x3b82f6) // Blue
      .addFields(
        {
          name: '🚀 Getting Started',
          value: '[Quick start guide →](https://wise2.net/docs)',
        },
        {
          name: '📖 Feature Guides',
          value: '[Learn each feature →](https://wise2.net/docs/features)',
        },
        {
          name: '🎓 Video Tutorials',
          value: '[Watch how-to videos →](https://wise2.net/docs/videos)',
        },
        {
          name: '💡 Best Practices',
          value: '[Maximize your success →](https://wise2.net/docs/best-practices)',
        },
        {
          name: '⚙️ API Documentation',
          value: '[Developer docs →](https://wise2.net/api/docs)',
        }
      )
      .setFooter({ text: 'Updated regularly with new guides' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Browse Docs')
        .setURL('https://wise2.net/docs')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorCompare(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('⚖️ Contractor OS vs Others')
      .setDescription('Why contractors choose Contractor OS')
      .setColor(0xf59e0b) // Amber
      .addFields(
        {
          name: '✅ Contractor OS',
          value:
            '• All-in-one platform\n' +
            '• AI-powered automation\n' +
            '• Industry-specific templates\n' +
            '• Built for contractors\n' +
            '• 30-day free trial',
          inline: true,
        },
        {
          name: '❌ Alternatives',
          value:
            '• Multiple tools to manage\n' +
            '• Manual workflows\n' +
            '• Generic solutions\n' +
            '• Built for enterprises\n' +
            '• Expensive or limited trials',
          inline: true,
        },
        {
          name: '💰 Cost Comparison',
          value:
            'Most contractors pay $500-2000/month for 7+ tools.\n\n' +
            'Contractor OS costs 60-80% less for a better experience.',
          inline: false,
        }
      )
      .setFooter({ text: 'See detailed comparison at wise2.net' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Comparison')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Try Free')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorContact(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📞 Contact Us')
      .setDescription('Get in touch with the Contractor OS team')
      .setColor(0x22c55e) // Green
      .addFields(
        {
          name: '📧 Email',
          value: 'hello@wise2.net',
        },
        {
          name: '💬 Live Chat',
          value: 'Available 9am-5pm EST, weekdays',
        },
        {
          name: '📞 Sales Demo',
          value: '[Schedule a 30-min demo →](https://wise2.net/contractor#demo)',
        },
        {
          name: '🆘 Support',
          value: 'support@wise2.net • Response within 2 hours',
        },
        {
          name: '🔗 Connect',
          value: '[Discord](https://discord.gg/wise2) • [Twitter](https://twitter.com/wise2)',
        }
      )
      .setFooter({ text: 'We\'re here to help!' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Schedule Demo')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Send Email')
        .setURL('mailto:hello@wise2.net')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academy(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎓 WISE² Academy')
      .setDescription('Master Contractor OS with our comprehensive training program')
      .setColor(0x8b5cf6) // Purple
      .setURL('https://wise2.net/academy')
      .addFields(
        {
          name: '📚 What You\'ll Learn',
          value:
            '• Complete Contractor OS setup & workflow\n' +
            '• How to use AI Operator effectively\n' +
            '• Advanced automation & custom workflows\n' +
            '• Industry best practices from experts',
          inline: false,
        },
        {
          name: '🎯 For Everyone',
          value:
            '**Beginners**: Get up and running in 15 minutes\n' +
            '**Intermediate**: Unlock advanced features\n' +
            '**Advanced**: Master customization & APIs',
          inline: false,
        },
        {
          name: '✨ Academy Benefits',
          value:
            '✓ Self-paced video courses\n' +
            '✓ Live group training sessions\n' +
            '✓ 1-on-1 coaching available\n' +
            '✓ Official certification\n' +
            '✓ Exclusive templates & resources',
          inline: false,
        }
      )
      .setFooter({ text: 'Free for all Contractor OS users' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Browse Academy')
        .setURL('https://wise2.net/academy')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('View Courses')
        .setURL('https://wise2.net/academy/courses')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academyCourses(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📚 WISE² Academy Courses')
      .setDescription('Choose your learning path')
      .setColor(0x8b5cf6) // Purple
      .setURL('https://wise2.net/academy/courses')
      .addFields(
        {
          name: '🚀 Beginner Track',
          value:
            '**Contractor OS Essentials** (2 hours)\n' +
            '→ Setup, dashboard, first lead\n\n' +
            '**CRM Mastery** (3 hours)\n' +
            '→ Lead capture, tracking, follow-up',
          inline: true,
        },
        {
          name: '⭐ Intermediate Track',
          value:
            '**Jobs & Dispatch** (2 hours)\n' +
            '→ Scheduling, crew management, tracking\n\n' +
            '**Estimates & Invoicing** (2.5 hours)\n' +
            '→ Proposals, e-signatures, payments',
          inline: true,
        },
        {
          name: '🏆 Advanced Track',
          value:
            '**AI Operator Mastery** (2 hours)\n' +
            '→ Automation, workflows, AI actions\n\n' +
            '**Custom Integrations** (3 hours)\n' +
            '→ API, webhooks, Zapier',
          inline: true,
        },
        {
          name: '🎯 Specialty Courses',
          value:
            '**Industry Guides** — HVAC, Roofing, Plumbing, etc.\n' +
            '**Business Growth** — Systems, scaling, team building\n' +
            '**Marketing Automation** — Campaigns, follow-up sequences',
          inline: false,
        }
      )
      .setFooter({ text: 'Start any course at any time' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View All Courses')
        .setURL('https://wise2.net/academy/courses')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Start Learning')
        .setURL('https://wise2.net/academy/enroll')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academyCertification(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🏆 Contractor OS Certified')
      .setDescription('Earn your official certification')
      .setColor(0xfbbf24) // Amber
      .setURL('https://wise2.net/academy/certification')
      .addFields(
        {
          name: '📜 What You Get',
          value:
            '✓ Official WISE² Certificate\n' +
            '✓ Digital badge for your LinkedIn profile\n' +
            '✓ "Certified Contractor OS Expert" title\n' +
            '✓ Exclusive partner directory listing\n' +
            '✓ Priority support access',
          inline: false,
        },
        {
          name: '🎯 Certification Path',
          value:
            '1. Complete beginner & intermediate courses (7 hours)\n' +
            '2. Pass the certification exam (90 min)\n' +
            '3. Complete a capstone project\n' +
            '4. Receive your official certificate',
          inline: false,
        },
        {
          name: '⏱️ Time Investment',
          value: 'Average: 10-12 hours spread over 2-4 weeks',
        },
        {
          name: '✨ Benefits',
          value:
            'Build credibility • Attract more clients • Command higher rates • Join exclusive network',
          inline: false,
        }
      )
      .setFooter({ text: 'Certification valid for 2 years' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Learn More')
        .setURL('https://wise2.net/academy/certification')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Start Courses')
        .setURL('https://wise2.net/academy/enroll')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academyEnroll(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('✍️ Enroll in Courses')
      .setDescription('Start learning at your own pace')
      .setColor(0x10b981) // Emerald
      .setURL('https://wise2.net/academy/enroll')
      .addFields(
        {
          name: '🎯 Choose Your Path',
          value:
            '**Self-Paced** — Learn anytime, anywhere\n' +
            '📹 Video lessons + downloadable resources\n' +
            '✨ Lifetime access to course materials\n' +
            '🎓 Progress tracking & certificates',
          inline: false,
        },
        {
          name: '👥 Live Group Training',
          value:
            '🗓️ Weekly sessions — Tuesdays & Thursdays\n' +
            '💬 Ask questions live\n' +
            '🤝 Network with other contractors\n' +
            '📹 Sessions recorded for later viewing',
          inline: false,
        },
        {
          name: '1️⃣ Private Coaching',
          value:
            '👨‍🏫 One-on-one sessions with WISE² experts\n' +
            '⏰ Flexible scheduling\n' +
            '🎯 Personalized to your business needs\n' +
            '🚀 Accelerate your results',
          inline: false,
        },
        {
          name: '💰 Pricing',
          value:
            'Free courses included with Contractor OS\n' +
            'Premium courses from $29-99\n' +
            'Group training from $149/month\n' +
            'Private coaching from $99/hour',
          inline: false,
        }
      )
      .setFooter({ text: 'Start learning today' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Enroll Now')
        .setURL('https://wise2.net/academy/enroll')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('View Schedule')
        .setURL('https://wise2.net/academy/schedule')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academySchedule(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📅 Academy Schedule')
      .setDescription('Live training sessions & class times')
      .setColor(0x06b6d4) // Cyan
      .setURL('https://wise2.net/academy/schedule')
      .addFields(
        {
          name: '🗓️ Weekly Live Sessions',
          value:
            '**Tuesday, 2pm EST** — CRM & Leads Mastery\n' +
            '**Wednesday, 10am EST** — Jobs & Dispatch Deep Dive\n' +
            '**Thursday, 3pm EST** — AI Operator Workshop\n' +
            '**Friday, 11am EST** — Q&A & Office Hours',
          inline: false,
        },
        {
          name: '📍 Upcoming Bootcamps',
          value:
            '**Sept 15-19** — Contractor OS Intensive (5-day)\n' +
            '**Oct 1-5** — Advanced Automation Bootcamp\n' +
            '**Oct 20-24** — Industry-Specific Workshop (HVAC)',
          inline: false,
        },
        {
          name: '🌍 Time Zones',
          value:
            'EST • CST • MST • PST sessions available\n' +
            'All sessions recorded & replayed',
          inline: false,
        },
        {
          name: '✨ No Experience Needed',
          value:
            'Whether you\'re brand new or an advanced user,\n' +
            'there\'s a course for your skill level.',
          inline: false,
        }
      )
      .setFooter({ text: 'Register in advance to get the Zoom link' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Full Schedule')
        .setURL('https://wise2.net/academy/schedule')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Register for Session')
        .setURL('https://wise2.net/academy/enroll')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academyResources(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Academy Resources')
      .setDescription('Learning materials, templates & guides')
      .setColor(0x3b82f6) // Blue
      .setURL('https://wise2.net/academy/resources')
      .addFields(
        {
          name: '📹 Video Library',
          value:
            '100+ tutorial videos\n' +
            'Search by feature or trade\n' +
            'Closed captions available\n' +
            'Downloadable transcripts',
          inline: true,
        },
        {
          name: '📄 Templates & Guides',
          value:
            'CRM setup checklist\n' +
            'Sales follow-up sequences\n' +
            'Workflow templates\n' +
            'Industry playbooks (HVAC, Roofing, etc.)',
          inline: true,
        },
        {
          name: '📊 Spreadsheets & Tools',
          value:
            'ROI calculator\n' +
            'Pricing templates\n' +
            'Lead scoring worksheet\n' +
            'Team onboarding checklist',
          inline: true,
        },
        {
          name: '📚 Documentation',
          value:
            'Feature guides\n' +
            'API documentation\n' +
            'Integration guides\n' +
            'Troubleshooting FAQs',
          inline: true,
        },
        {
          name: '🎙️ Podcasts & Webinars',
          value:
            'Weekly contractor success podcast\n' +
            'Monthly expert webinars\n' +
            'Past session recordings\n' +
            'Guest expert interviews',
          inline: false,
        }
      )
      .setFooter({ text: 'All resources free with Contractor OS' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Browse Resources')
        .setURL('https://wise2.net/academy/resources')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Download Templates')
        .setURL('https://wise2.net/academy/resources/templates')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async academyInstructors(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('👨‍🏫 WISE² Academy Instructors')
      .setDescription('Learn from industry experts')
      .setColor(0xec4899) // Pink
      .setURL('https://wise2.net/academy/instructors')
      .addFields(
        {
          name: '🏆 Lead Instructor',
          value:
            '**Daniel Wise** — Founder & Contractor OS Creator\n' +
            '20+ years in service business automation\n' +
            'Specializes in: CRM, automation, business growth',
        },
        {
          name: '⭐ Expert Instructors',
          value:
            '**Sarah Chen** — HVAC & Home Services Specialist\n' +
            '15 years in HVAC business management\n\n' +
            '**Marcus Johnson** — Sales & Lead Generation\n' +
            'Helped 500+ contractors close 40% more deals\n\n' +
            '**Lisa Rodriguez** — Team Building & Operations\n' +
            'Scaled 5 service businesses to 6-figures+',
          inline: false,
        },
        {
          name: '🎓 Guest Experts',
          value:
            'Monthly sessions with:\n' +
            '• Successful contractors from your trade\n' +
            '• Business coaches & consultants\n' +
            '• Marketing & SEO specialists\n' +
            '• Financial advisors',
          inline: false,
        }
      )
      .setFooter({ text: 'All instructors are practicing contractors/experts' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Meet the Team')
        .setURL('https://wise2.net/academy/instructors')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Book Coaching')
        .setURL('https://wise2.net/academy/coaching')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },
};

module.exports = {
  commands,
  handlers,
};
