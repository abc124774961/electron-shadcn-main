import { createServer, type IncomingMessage } from "node:http";
import type { Socket } from "node:net";
import net from "node:net";
import { parse } from "node:url";
import { SocksClient, SocksClientOptions } from "socks";

// 错误处理
function errorHandler(clientSocket: Socket, proxySocket?: Socket): (error: Error) => void {
    return (err: Error) => {
        // 如果处理请求时发生错误，向客户端发送错误响应，并关闭连接。
        clientSocket.write("HTTP/1.1 502 Bad Gateway\r\n\r\n");
        clientSocket.end("Proxy socket error: " + err.message);
        clientSocket.destroy();
        proxySocket?.destroy();
        console.error("Socks Proxy Socket Error: ", err.message);
    };
}

// 目标域名列表，这些域名不使用代理
const bypassProxyDomains = ["static-s3.mtt.xyz", "sports.mtt.xyz", "aliyuncs.com", "localhost"];
const whiteProxyDomains = [
    "api.mtt.xyz",
    "static-s3.mtt.xyz",
    "cdn-web.mtt.xyz",
    "eagleapi-sg.mtt.xyz",
    "cdn-mttweb.mtt.xyz",
    "api.gawallet.org",
    "266-mtt.oss-ap-southeast-1.aliyuncs.com",
];

/**
 * @description 解决session无法验证用户名密码
 * @param { string } proxyRules 代理地址 [socks4/5]://[userId]:[password]@[host]:[port]
 * @returns { string } 本地Http代理地址
 */
export async function sockProxyRules(proxyRules: string): Promise<string> {
    // 解析代理规则 [_,type,userId,password,host,port]
    const proxyRulesList = proxyRules.match(/socks(\d+):\/\/(.*):(.*?)@(.*):(\d+)/);

    if (!proxyRulesList) return Promise.reject("Invalid proxy rules.");

    // 从解析结果中提取各个部分
    const [, type, userId, password, host, port] = proxyRulesList;

    // 定义SOCKS客户端选项，包括代理服务器的详细信息
    const socksOptions: SocksClientOptions = {
        proxy: {
            host,
            port: Number.parseInt(port),
            type: Number.parseInt(type) as 4 | 5,
            userId,
            password,
        },
        command: "connect",
        destination: { host: "", port: 0 },
    };

    // function createConnection(hostname: string, callback: (args1: any, args2: any) => void) {
    //     if (bypassProxyDomains.includes(hostname)) {
    //         // 如果是跳过代理的域名，直接创建一个普通的HTTP连接
    //         return callback(null, new net.Socket());
    //     }

    //     // 使用SOCKS5代理连接
    //     socks5Client.createConnection(
    //         {
    //             proxy: {
    //                 host: proxyServer,
    //                 port: proxyPort,
    //                 type: 5, // 代理类型SOCKS5
    //             },
    //             command: "connect", // 代理命令CONNECT
    //             destination: {
    //                 host: hostname,
    //                 port: 80, // 目标端口
    //             },
    //         },
    //         callback
    //     );
    // }

    // 创建一个HTTP服务器，用于接收代理请求
    const httpServer = createServer(async (req, res) => {
        if (!req.url) return;

        // 解析请求URL，获取主机和端口信息
        const urlObject = parse(req.url);

        if (!urlObject.hostname) return;

        // 更新目标主机和端口信息
        socksOptions.destination.host = urlObject.hostname;
        socksOptions.destination.port = Number.parseInt(urlObject.port ?? "80");

        try {
            // 使用SOCKS客户端创建到目标的连接
            const { socket } = await SocksClient.createConnection(socksOptions);
            // 将请求数据转发到SOCKS连接
            req.pipe(socket);
            // 将SOCKS连接的数据转发给响应
            socket.pipe(res);
        } catch (error) {
            // 如果创建连接失败，返回502错误
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Proxy request error: " + (error as Error).message);
        }
    });

    let defaultSocket = new net.Socket();

    // 处理HTTP服务器的'connect'事件，用于TCP代理
    httpServer.on("connect", async (req: IncomingMessage, proxySocket: Socket, head: Buffer) => {
        // 解析客户端请求的URL，以获取目标主机和端口。
        const parsedUrl = parse("https://" + (req.url ?? ""));
        const { hostname, port } = parsedUrl;
        //判断是否是跳过代理的域名
        let clientSocket = defaultSocket;
        // if (bypassProxyDomains.includes(hostname || "")) {
        //     _curSocket = defaultSocket;
        //     console.log("bypassProxyDomains--------", hostname);
        // }
        if (whiteProxyDomains.includes(hostname || "")) {
            clientSocket = proxySocket;
        } else {
            console.log("parsedUrl", req.url, hostname);
            // clientSocket = proxySocket;
        }
        // 如果URL解析失败，抛出错误。
        if (!hostname || !port) throw new Error("Invalid client request URL.");
        // bypassProxyDomains.includes(hostname)
        socksOptions.destination.host = hostname;
        socksOptions.destination.port = Number.parseInt(port);

        try {
            // 使用SOCKS客户端创建到目标的连接
            const { socket } = await SocksClient.createConnection(socksOptions);

            // 监听代理连接和客户端连接的错误事件。
            clientSocket.on("error", errorHandler(clientSocket, socket));
            socket.on("error", errorHandler(clientSocket, socket));

            // 发送连接成功的响应
            clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");

            // 将头部信息转发到SOCKS连接
            socket.write(head);

            // 双向转发数据
            socket.pipe(clientSocket);
            clientSocket.pipe(socket);
        } catch (error) {
            errorHandler(clientSocket)(error as Error);
        }
    });

    httpServer.on("error", (error) => {
        console.error("Socks Proxy Server Error: ", error.message);
    });

    // 生成随机端口，启动HTTP服务器
    // const randomPort = await getAvailablePort()
    const randomPort = Math.floor(1e4 * Math.random()) + 5e4;

    httpServer.listen(randomPort);

    // 返回HTTP代理服务器的地址
    return `http://127.0.0.1:${randomPort}`;
}
