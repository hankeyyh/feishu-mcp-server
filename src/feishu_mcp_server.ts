import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as lark from '@larksuiteoapi/node-sdk';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import http from 'http';
import { logger } from "./logger";


export class FeiShuMcpServer {
    feishuClient: lark.Client;
    mcpServer: McpServer;
    sseTransport: SSEServerTransport | null;
    httpServer: http.Server | null;

    constructor(mcpServer: McpServer, feishuClient: lark.Client) {
        this.feishuClient = feishuClient;
        this.mcpServer = mcpServer;
        this.sseTransport = null;
        this.httpServer = null;
    }

    Init() {
        logger.info('开始注册工具...');
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
                    logger.info('调用 getWikiDoc:', args);
                    try {
                        const doc = await this.getWikiDoc(args.token);
                        logger.info('getWikiDoc 成功');
                        return {
                            content: [{ type: "text", text: doc || "" }]
                        }
                    } catch (err) {
                        logger.error('getWikiDoc 失败:', err);
                        return {
                            content: [{ type: "text", text: `Error: ${err}` }]
                        }
                    }
                }
            );
            logger.info('Wiki 工具注册完成');

            // 文档挂载在云盘（或文件夹）
            this.mcpServer.tool("getDocx",
                "Retrieve the content of Feishu document directly",
                {
                    token: z.string().describe(
                        "The token of the feishu document to fetch, often found in a provided URL like feishu.cn/docx/<documentId>..."
                    )
                },
                async (args) => {
                    logger.info('调用 getDocx:', args);
                    try {
                        const doc = await this.getDocx(args.token);
                        logger.info('getDocx 成功');
                        return {
                            content: [{ type: "text", text: doc || "" }]
                        }
                    } catch (err) {
                        logger.error('getDocx 失败:', err);
                        return {
                            content: [{ type: "text", text: `Error: ${err}` }]
                        }
                    }
                }
            );
            logger.info('Docx 工具注册完成');
        } catch (error) {
            logger.error('工具注册失败:', error);
            throw error;
        }
    }

    async getWikiDoc(token: string) {
        logger.info('获取 Wiki 文档:', token);
        const response = await this.feishuClient.wiki.v2.space.getNode({
            params: {
                token: token,
                obj_type: "wiki"
            }
        });
        logger.info('Wiki API 响应:', response);
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
        logger.info('获取 Docx 文档:', token);
        const response = await this.feishuClient.docx.v1.document.rawContent({
            path: {
                document_id: token
            }
        });
        logger.info('Docx API 响应:', response);
        if (response.code !== 0) {
            throw new Error(`Failed to get docx content: ${response.msg}`);
        }
        return response.data?.content;
    }

    async startStdioServer() {
        logger.info('启动stdio服务器...');
        try {
            const transport = new StdioServerTransport();
            await this.mcpServer.connect(transport);
        } catch (error) {
            logger.error('服务器启动失败:', error);
            throw error;
        }
    }

    async startSSEServer(port: number) {
        logger.info('启动SSE服务器...');
        try {
            const app = express();
            app.get("/sse", async (req, rsp) => {
                this.sseTransport = new SSEServerTransport("/messages", rsp);
                await this.mcpServer.connect(this.sseTransport);
            })
            app.post("/messages", async (req, rsp) => {
                if (!this.sseTransport) {
                    rsp.status(400).send("SSE 服务器未启动");
                    return;
                }
                await this.sseTransport.handlePostMessage(req, rsp);
            })
            this.httpServer = app.listen(port, (err) => {
                if (err) {
                    logger.error('SSE 服务器启动失败:', err);
                    throw err;
                }
                logger.info(`SSE endpoint available at: http://localhost:${port}/sse`);
                logger.info(`message endpoint available at: http://localhost:${port}/messages`);
            })            
        } catch (error) {
            logger.error('服务器启动失败:', error);
            throw error;
        }
    }

    async stopServer() {
        logger.info('正在关闭服务器...');
        if (this.httpServer) {
            this.httpServer.close((err) => {
                logger.info('HTTP 服务器已关闭', err ? err : '');
            });
        }
        await this.mcpServer.close();
        logger.info('MCP 服务器已关闭');
    }
}
