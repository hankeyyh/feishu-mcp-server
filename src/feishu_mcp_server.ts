import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as lark from '@larksuiteoapi/node-sdk';

// 调试日志函数
function debug(...args: any[]) {
  if (process.env.DEBUG === 'true') {
    console.error('[DEBUG]', ...args);
  }
}

export class FeiShuMcpServer {
    feishuClient: lark.Client;
    mcpServer: McpServer;

    constructor(mcpServer: McpServer, feishuClient: lark.Client) {
        this.feishuClient = feishuClient;
        this.mcpServer = mcpServer;
    }

    Init() {
        debug('开始注册工具...');
        try {
            // 文档挂载在知识空间
            this.mcpServer.tool("getWikiDoc",
                "Retrieve the content of Feishu document from wiki space",
                {
                    token: z.string().describe(
                        "The token of the feishu file to fetch, often found in a provided URL like feishu.cn/wiki/<documentId>...",
                    )
                },
                async (args) => {
                    debug('调用 getWikiDoc:', args);
                    try {
                        const doc = await this.getWikiDoc(args.token);
                        debug('getWikiDoc 成功');
                        return {
                            content: [{ type: "text", text: doc || "" }]
                        }
                    } catch (err) {
                        debug('getWikiDoc 失败:', err);
                        return {
                            content: [{ type: "text", text: `Error: ${err}` }]
                        }
                    }
                }
            );
            debug('Wiki 工具注册完成');

            // 文档挂载在云盘（或文件夹）
            this.mcpServer.tool("getDocx",
                "Retrieve the content of Feishu document directly",
                {
                    token: z.string().describe(
                        "The token of the feishu document to fetch, often found in a provided URL like feishu.cn/docx/<documentId>..."
                    )
                },
                async (args) => {
                    debug('调用 getDocx:', args);
                    try {
                        const doc = await this.getDocx(args.token);
                        debug('getDocx 成功');
                        return {
                            content: [{ type: "text", text: doc || "" }]
                        }
                    } catch (err) {
                        debug('getDocx 失败:', err);
                        return {
                            content: [{ type: "text", text: `Error: ${err}` }]
                        }
                    }
                }
            );
            debug('Docx 工具注册完成');
        } catch (error) {
            console.error('工具注册失败:', error);
            throw error;
        }
    }

    async getWikiDoc(token: string) {
        debug('获取 Wiki 文档:', token);
        const response = await this.feishuClient.wiki.v2.space.getNode({
            params: {
                token: token,
                obj_type: "wiki"
            }
        });
        debug('Wiki API 响应:', response);
        if (response.code !== 0) {
            throw new Error(`Failed to get wiki node: ${response.msg}`);
        }
        const node = response.data?.node;
        if (!node) {
            throw new Error("Failed to get wiki node");
        }
        if (node.obj_type === "docx") {
            return this.getDocx(node.obj_token!);
        }
        throw new Error("Unsupported document type");
    }

    async getDocx(token: string) {
        debug('获取 Docx 文档:', token);
        const response = await this.feishuClient.docx.v1.document.rawContent({
            path: {
                document_id: token
            }
        });
        debug('Docx API 响应:', response);
        if (response.code !== 0) {
            throw new Error(`Failed to get docx content: ${response.msg}`);
        }
        return response.data?.content;
    }

    async startServer(transport: any) {
        debug('开始启动服务器...');
        try {
            await this.mcpServer.connect(transport);
            debug('服务器连接成功');
        } catch (error) {
            debug('服务器启动失败:', error);
            throw error;
        }
    }
}
