import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MinioProxyMiddleware implements NestMiddleware {
    private proxy: RequestHandler;

    constructor(private readonly configService: ConfigService<AllConfigType>) {
        const endpoint = this.configService.get('file.minioEndpoint', { infer: true });
        if (!endpoint) {
            throw new Error('file.minioEndpoint is not configured');
        }
        const endpointUrl = new URL(endpoint);

        this.proxy = createProxyMiddleware({
            target: endpoint,
            changeOrigin: true,
            pathRewrite: { '^/minio-proxy': '' },
            on: {
                proxyReq: (proxyReq) => {
                    proxyReq.setHeader('Host', endpointUrl.host); // e.g. localhost:9000
                },
            },
        });
    }

    use(req: Request, res: Response, next: NextFunction) {
        this.proxy(req, res, next);
    }
}