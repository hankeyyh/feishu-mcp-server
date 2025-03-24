# feishu-mcp-server

飞书文档 MCP 服务器，用于通过 MCP 协议访问飞书文档。

## 功能特性

- 支持访问飞书知识库文档
- 支持访问飞书云文档
- 支持 MCP 协议集成到 AI 应用中

## 前期准备

1. 在[飞书开放平台](https://open.feishu.cn/)创建应用
2. 对应用进行[文档授权](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)


## 在Cursor中使用

1. 全局安装：

```bash
npm install -g feishu-mcp-server
```

2. Cursor MCP 支持两种模式，任选一种：

- Command 模式：

在Cursor Mcp Model 中配置，选择 Command 模式，输入

Windows:
```cmd
cmd /c feishu-mcp start-server --app_id <app_id> --app_secret <app_secret>
```

macOS/Linux:
```bash
feishu-mcp start-server --app_id <app_id> --app_secret <app_secret>
```

- SSE 模式

在控制台启动 Server：
``` bash
feishu-mcp start-server --app_id <app_id> --app_secret <app_secret> --sse --port <port>
```

在Cursor Mcp Model 中配置，选择 SSE 模式，输入

``` bash
http://localhost:<port>/sse
```

## 配置说明

需要配置以下参数：

- `app_id`: 飞书应用 App ID
- `app_secret`: 飞书应用 App Secret
- `sse`: 用 SSE 模式启动
- `port`: SSE 端口

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
