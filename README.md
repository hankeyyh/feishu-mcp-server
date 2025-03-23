# feishu-mcp-server

飞书文档 MCP 服务器，用于通过 MCP 协议访问飞书文档。

## 功能特性

- 支持访问飞书知识库文档
- 支持访问飞书云文档
- 支持 MCP 协议集成到 AI 应用中


## 在Cursor中使用

1. 全局安装：

```bash
npm install -g feishu-mcp-server
```

2. 在Cursor Mcp Model 中输入：

Windows:
```cmd
cmd /c feishu-mcp start-server --app_id <app_id> --app_secret <app_secret>
```

macOS/Linux:
```bash
feishu-mcp start-server --app_id <app_id> --app_secret <app_secret>
```

## 配置说明

需要配置以下参数：

- `app_id`: 飞书应用的 App ID
- `app_secret`: 飞书应用的 App Secret
- `log`: 日志文件路径（可选）

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 本地安装 CLI
npm run install-cli

# 卸载 CLI
npm run uninstall-cli
```

## License

ISC
