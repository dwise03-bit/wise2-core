import { BotBase } from '../BotBase.js';
import { EmbedBuilder } from 'discord.js';
import { v4 as uuid } from 'uuid';
import pino from 'pino';

const logger = pino();

interface Task {
  id: string;
  title: string;
  assignee?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: number;
  createdAt: number;
}

export class TaskBot extends BotBase {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'TaskBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'task',
      description: 'Create task',
      usage: '!task <title>',
      execute: async (args, context) => {
        const title = args.join(' ');
        if (!title) {
          await context.message.reply('❌ Usage: `!task <title>`');
          return;
        }
        await this.createTask(title, context.message);
      },
    });

    this.registerCommand({
      name: 'tasks',
      description: 'List tasks',
      usage: '!tasks [filter]',
      execute: async (args, context) => {
        const filter = args[0] || 'all';
        await this.listTasks(filter, context.message);
      },
    });

    this.registerCommand({
      name: 'assign',
      description: 'Assign task',
      usage: '!assign <task-id> <@user>',
      execute: async (args, context) => {
        const taskId = args[0];
        const assignee = context.message.mentions.members?.first();
        if (!taskId || !assignee) {
          await context.message.reply(
            '❌ Usage: `!assign <task-id> <@user>`',
          );
          return;
        }
        await this.assignTask(taskId, assignee.id, context.message);
      },
    });

    this.registerCommand({
      name: 'done',
      description: 'Mark task done',
      usage: '!done <task-id>',
      execute: async (args, context) => {
        const taskId = args[0];
        if (!taskId) {
          await context.message.reply('❌ Usage: `!done <task-id>`');
          return;
        }
        await this.markDone(taskId, context.message);
      },
    });
  }

  private async createTask(title: string, message: any): Promise<void> {
    const taskId = uuid().substring(0, 8);
    const task: Task = {
      id: taskId,
      title,
      status: 'todo',
      createdAt: Date.now(),
    };

    this.tasks.set(taskId, task);

    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('✅ Task Created')
      .addFields(
        {
          name: 'Task ID',
          value: taskId,
          inline: true,
        },
        {
          name: 'Title',
          value: title,
          inline: false,
        },
        {
          name: 'Status',
          value: '📝 Todo',
          inline: true,
        },
      );

    await message.reply({ embeds: [embed] });
    logger.info(`Created task: ${taskId}`);
  }

  private async listTasks(filter: string, message: any): Promise<void> {
    let tasks = Array.from(this.tasks.values());

    if (filter === 'todo') {
      tasks = tasks.filter((t) => t.status === 'todo');
    } else if (filter === 'in-progress') {
      tasks = tasks.filter((t) => t.status === 'in-progress');
    } else if (filter === 'done') {
      tasks = tasks.filter((t) => t.status === 'done');
    }

    if (tasks.length === 0) {
      await message.reply(
        `✅ No ${filter === 'all' ? '' : filter} tasks found!`,
      );
      return;
    }

    const fields = tasks.slice(0, 10).map((t) => ({
      name: `[${t.id}] ${t.title}`,
      value: `Status: ${t.status} ${t.assignee ? `• Assigned: <@${t.assignee}>` : ''}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`📋 Tasks (${filter})`)
      .addFields(...fields)
      .setFooter({ text: `Total: ${tasks.length}` });

    await message.reply({ embeds: [embed] });
  }

  private async assignTask(
    taskId: string,
    assigneeId: string,
    message: any,
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      await message.reply(`❌ Task not found: ${taskId}`);
      return;
    }

    task.assignee = assigneeId;

    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('✅ Task Assigned')
      .addFields(
        {
          name: 'Task',
          value: task.title,
          inline: true,
        },
        {
          name: 'Assigned To',
          value: `<@${assigneeId}>`,
          inline: true,
        },
      );

    await message.reply({ embeds: [embed] });
    logger.info(`Assigned task ${taskId} to ${assigneeId}`);
  }

  private async markDone(taskId: string, message: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      await message.reply(`❌ Task not found: ${taskId}`);
      return;
    }

    task.status = 'done';

    const embed = new EmbedBuilder()
      .setColor(0x00cc00)
      .setTitle('✅ Task Completed')
      .addFields({
        name: 'Task',
        value: task.title,
        inline: true,
      });

    await message.reply({ embeds: [embed] });
    logger.info(`Marked task ${taskId} as done`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new TaskBot();
  bot.connect();
}

export default TaskBot;
