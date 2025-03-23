#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as lark from '@larksuiteoapi/node-sdk';
import { DocMcpServer } from './feishu_mcp_server';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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
  .requiredOption('--app_id <app_id>', '飞书应用 app_id')
  .requiredOption('--app_secret <app_secret>', '飞书应用 app_secret')
  .action(async (options) => {
    try {
      // 初始化飞书客户端
      const client = new lark.Client({
        appId: options.app_id,
        appSecret: options.app_secret
      });

      // 初始化 MCP 服务器
      const server = new DocMcpServer('feishu-mcp', packageJson.version, client);
      server.Init();

      // 使用标准输入输出作为传输层
      const transport = new StdioServerTransport();

      console.log('正在启动服务器...');
      await server.startServer(transport);
    } catch (error) {
      console.error('服务器启动失败：', error);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();
