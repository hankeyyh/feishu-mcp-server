#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as lark from '@larksuiteoapi/node-sdk';
import { FeiShuMcpServer } from './feishu_mcp_server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from './log';
import { env } from './env';

// 手动读取 package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

// 基本信息配置
program
  .name('feishu-mcp')
  .description('飞书 MCP 服务器命令行工具')
  .version(packageJson.version);

// start-server 命令
program
  .command('start-server')
  .description('启动 MCP 服务器')
  .option('--app_id <app_id>', '飞书应用 app_id')
  .option('--app_secret <app_secret>', '飞书应用 app_secret')
  .option('--sse', '是否启用 SSE 模式')
  .option('--port <port>', '如启用 SSE 模式，指定端口号')
  .action(async (options) => {
    try {
      const appId = options.app_id || env.appId;
      const appSecret = options.app_secret || env.appSecret;
      const sse = options.sse || env.sse;
      const port = options.port || env.port;

      if (!appId || !appSecret) {
        throw new Error('缺少必要的配置：APP_ID 和 APP_SECRET。请在 .env 文件中设置或通过命令行参数提供。');
      }
      if (sse && !port) {
        throw new Error('如启用 SSE 模式，请指定端口号。');
      }

      // 初始化飞书客户端
      const client = new lark.Client({
        appId,
        appSecret
      });
      // 初始化 MCP 服务器
      const mcpServer = new McpServer({
        name: 'feishu-mcp',
        version: packageJson.version
      })

      // 初始化 MCP 服务器
      const server = new FeiShuMcpServer(mcpServer, client);
      server.Init();

      // 监听 SIGINT 信号
      process.on('SIGINT', async () => {
        await server.stopServer();
      });

      // 监听 SIGTERM 信号
      process.on('SIGTERM', async () => {
        await server.stopServer();
      });

      // 启动 feishu-mcp-server
      if (sse) {
        await server.startSSEServer(port);
      } else {
        await server.startStdioServer();
      }

    } catch (error) {
      logger.error('服务器启动失败：', error);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();
