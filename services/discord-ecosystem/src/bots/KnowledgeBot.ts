/**
 * WISE² Discord Ecosystem - Knowledge Bot
 * Search vault, query knowledge graph, documentation lookup
 */

import { BotFramework } from '../BotFramework';
import { BotConfig, KnowledgeEntry, SearchResult } from '../types';
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export class KnowledgeBot extends BotFramework {
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // tag -> entry ids

  constructor(config: BotConfig) {
    super(config);
    this.setupCommands();
    this.initializeKnowledgeBase();
  }

  private setupCommands(): void {
    // Search command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search knowledge base')
        .addStringOption(opt =>
          opt.setName('query').setDescription('Search query').setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName('category')
            .setDescription('Filter by category')
            .setRequired(false)
        )
        .addIntegerOption(opt =>
          opt
            .setName('limit')
            .setDescription('Maximum results')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(10)
        ),
      execute: this.searchCommand.bind(this),
    });

    // Knowledge lookup command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('knowledge')
        .setDescription('Lookup knowledge entry')
        .addStringOption(opt =>
          opt.setName('topic').setDescription('Topic to lookup').setRequired(true)
        ),
      execute: this.knowledgeCommand.bind(this),
    });

    // Browse categories command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('categories')
        .setDescription('Browse knowledge categories'),
      execute: this.categoriesCommand.bind(this),
    });

    // Recent articles command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('recent-articles')
        .setDescription('View recently updated articles')
        .addIntegerOption(opt =>
          opt
            .setName('limit')
            .setDescription('Number of articles')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        ),
      execute: this.recentArticlesCommand.bind(this),
    });

    // Tag search command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('tags')
        .setDescription('Search by tags')
        .addStringOption(opt =>
          opt.setName('tag').setDescription('Tag to search').setRequired(true)
        ),
      execute: this.tagsCommand.bind(this),
    });

    // Suggest topic command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('suggest-topic')
        .setDescription('Suggest a new knowledge topic')
        .addStringOption(opt =>
          opt.setName('title').setDescription('Topic title').setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName('description')
            .setDescription('Topic description')
            .setRequired(false)
        ),
      execute: this.suggestTopicCommand.bind(this),
    });

    // Add entry command (admin)
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('knowledge-add')
        .setDescription('Add knowledge entry (admin only)')
        .addStringOption(opt =>
          opt.setName('title').setDescription('Entry title').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('content').setDescription('Entry content').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('category').setDescription('Category').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('tags').setDescription('Tags (comma-separated)').setRequired(false)
        ),
      execute: this.addEntryCommand.bind(this),
      requiresAdmin: true,
    });
  }

  private initializeKnowledgeBase(): void {
    // Sample knowledge entries
    const entries: KnowledgeEntry[] = [
      {
        id: '1',
        title: 'Getting Started with WISE²',
        content:
          'WISE² is an enterprise organized chaos command center. Start by...',
        tags: ['setup', 'introduction', 'getting-started'],
        category: 'Getting Started',
        url: 'https://docs.wise2.ai/getting-started',
        lastUpdated: Date.now(),
        author: 'admin',
      },
      {
        id: '2',
        title: 'Deployment Guide',
        content: 'Deploy WISE² to production using Docker and Kubernetes...',
        tags: ['deployment', 'production', 'docker', 'kubernetes'],
        category: 'Deployment',
        url: 'https://docs.wise2.ai/deployment',
        lastUpdated: Date.now(),
        author: 'admin',
      },
      {
        id: '3',
        title: 'API Reference',
        content: 'Complete API documentation for WISE² services...',
        tags: ['api', 'reference', 'rest', 'graphql'],
        category: 'API',
        url: 'https://docs.wise2.ai/api',
        lastUpdated: Date.now(),
        author: 'admin',
      },
      {
        id: '4',
        title: 'Troubleshooting Guide',
        content: 'Common issues and how to resolve them...',
        tags: ['troubleshooting', 'help', 'faq'],
        category: 'Support',
        url: 'https://docs.wise2.ai/troubleshooting',
        lastUpdated: Date.now(),
        author: 'admin',
      },
      {
        id: '5',
        title: 'Bot Framework Architecture',
        content: 'Understanding the Discord bot framework and extensibility...',
        tags: ['bots', 'architecture', 'framework'],
        category: 'Architecture',
        url: 'https://docs.wise2.ai/bots',
        lastUpdated: Date.now(),
        author: 'admin',
      },
    ];

    for (const entry of entries) {
      this.knowledgeBase.set(entry.id, entry);
      for (const tag of entry.tags) {
        if (!this.searchIndex.has(tag)) {
          this.searchIndex.set(tag, new Set());
        }
        this.searchIndex.get(tag)!.add(entry.id);
      }
    }

    this.logger.info(this.config.name, 'Init', `Knowledge base initialized with ${entries.length} entries`);
  }

  private async searchCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const query = interaction.options.getString('query', true);
      const category = interaction.options.getString('category');
      const limit = interaction.options.getInteger('limit') || 5;

      const startTime = Date.now();
      let results = Array.from(this.knowledgeBase.values());

      // Filter by category if specified
      if (category) {
        results = results.filter(e =>
          e.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Search by title or content
      results = results.filter(
        e =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.content.toLowerCase().includes(query.toLowerCase())
      );

      // Sort by relevance
      results.sort((a, b) => {
        const scoreA = a.title.toLowerCase().includes(query.toLowerCase()) ? 10 : 1;
        const scoreB = b.title.toLowerCase().includes(query.toLowerCase()) ? 10 : 1;
        return scoreB - scoreA;
      });

      results = results.slice(0, limit);

      const executionTime = Date.now() - startTime;

      if (results.length === 0) {
        await interaction.editReply({
          content: `❌ No results found for "${query}".`,
        });
        return;
      }

      const searchResult: SearchResult = {
        entries: results,
        totalResults: results.length,
        query,
        executionTime,
      };

      const fields = results.map(entry => ({
        name: `📄 ${entry.title}`,
        value: `**Category:** ${entry.category}\n**Tags:** ${entry.tags.join(', ')}\n${entry.content.substring(0, 80)}...`,
        inline: false,
      }));

      const embed = this.createEmbed({
        title: `🔍 Search Results: "${query}"`,
        description: `Found ${results.length} result(s) in ${executionTime}ms`,
        fields,
        color: 0x3498db,
      });

      await interaction.editReply({ embeds: [embed] });

      this.logger.info(this.config.name, 'Search', `Search query: "${query}"`, {
        results: results.length,
        executionTime,
      });

      this.auditLogger.log({
        userId: interaction.user.id,
        userName: interaction.user.username,
        guildId: interaction.guildId || 'DM',
        command: 'search',
        action: 'search_query',
        status: 'success',
        metadata: { query, results: results.length },
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async knowledgeCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const topic = interaction.options.getString('topic', true);

      const entry = Array.from(this.knowledgeBase.values()).find(e =>
        e.title.toLowerCase().includes(topic.toLowerCase())
      );

      if (!entry) {
        await interaction.editReply({
          content: `❌ Knowledge entry "${topic}" not found.`,
        });
        return;
      }

      const embed = this.createEmbed({
        title: `📖 ${entry.title}`,
        description: entry.content,
        fields: [
          { name: 'Category', value: entry.category, inline: true },
          { name: 'Author', value: entry.author || 'Unknown', inline: true },
          {
            name: 'Last Updated',
            value: new Date(entry.lastUpdated).toLocaleString(),
            inline: true,
          },
          { name: 'Tags', value: entry.tags.join(', '), inline: false },
          ...(entry.url ? [{ name: 'Full Article', value: `[View Online](${entry.url})`, inline: false }] : []),
        ],
        color: 0x2ecc71,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async categoriesCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const categories = new Map<string, number>();

      for (const entry of this.knowledgeBase.values()) {
        categories.set(entry.category, (categories.get(entry.category) || 0) + 1);
      }

      const fields = Array.from(categories.entries()).map(([cat, count]) => ({
        name: cat,
        value: `${count} article(s)`,
        inline: true,
      }));

      const embed = this.createEmbed({
        title: '📚 Knowledge Categories',
        description: `${categories.size} categories available`,
        fields,
        color: 0x9b59b6,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async recentArticlesCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const limit = interaction.options.getInteger('limit') || 10;

      const recent = Array.from(this.knowledgeBase.values())
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .slice(0, limit);

      const fields = recent.map(entry => ({
        name: entry.title,
        value: `${entry.category} • ${new Date(entry.lastUpdated).toLocaleDateString()}`,
        inline: false,
      }));

      const embed = this.createEmbed({
        title: '📰 Recent Articles',
        description: `Last ${recent.length} updated articles`,
        fields,
        color: 0x1abc9c,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async tagsCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const tag = interaction.options.getString('tag', true);

      const entryIds = this.searchIndex.get(tag.toLowerCase()) || new Set();
      const entries = Array.from(entryIds).map(id => this.knowledgeBase.get(id)!);

      if (entries.length === 0) {
        await interaction.editReply({
          content: `❌ No articles found with tag "${tag}".`,
        });
        return;
      }

      const fields = entries.slice(0, 10).map(entry => ({
        name: entry.title,
        value: entry.category,
        inline: true,
      }));

      const embed = this.createEmbed({
        title: `🏷️ Tag: ${tag}`,
        description: `${entries.length} article(s)`,
        fields,
        color: 0xf39c12,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async suggestTopicCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const title = interaction.options.getString('title', true);
      const description = interaction.options.getString('description');

      const embed = this.createEmbed({
        title: '✅ Suggestion Submitted',
        description: `"${title}"`,
        fields: [
          { name: 'Suggested By', value: `<@${interaction.user.id}>`, inline: true },
          ...(description ? [{ name: 'Details', value: description, inline: false }] : []),
        ],
        color: 0x00ff00,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Suggest', `Topic suggested: ${title}`, {
        userId: interaction.user.id,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async addEntryCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const title = interaction.options.getString('title', true);
      const content = interaction.options.getString('content', true);
      const category = interaction.options.getString('category', true);
      const tagsStr = interaction.options.getString('tags') || '';

      const id = `${this.knowledgeBase.size + 1}`;
      const tags = tagsStr.split(',').map(t => t.trim());

      const entry: KnowledgeEntry = {
        id,
        title,
        content,
        tags,
        category,
        lastUpdated: Date.now(),
        author: interaction.user.username,
      };

      this.knowledgeBase.set(id, entry);

      for (const tag of tags) {
        if (!this.searchIndex.has(tag.toLowerCase())) {
          this.searchIndex.set(tag.toLowerCase(), new Set());
        }
        this.searchIndex.get(tag.toLowerCase())!.add(id);
      }

      const embed = this.createEmbed({
        title: '✅ Entry Added',
        description: title,
        fields: [
          { name: 'ID', value: id, inline: true },
          { name: 'Category', value: category, inline: true },
          { name: 'Tags', value: tags.join(', '), inline: false },
        ],
        color: 0x00ff00,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Add', `Entry added: ${id}`, {
        title,
        category,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }
}

export default KnowledgeBot;
