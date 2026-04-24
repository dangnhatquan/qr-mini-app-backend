import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:2999',
        'http://localhost:3000',
        'https://h5.zadn.vn',
        'https://h5.zdn.vn',
        'https://mini.zalo.me',
        'https://zalo.me',
        'https://conjuror-overshot-headlamp.ngrok-free.dev'
      ];

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
      return allowedOrigins;
    },

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'ngrok-skip-browser-warning',
    ],

    credentials: false,
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

  if (process.env.NODE_ENV === 'development') {
    const minioEndpoint = configService.get('file.minioEndpoint', { infer: true }); // http://localhost:9000
    if (!minioEndpoint) {
      throw new Error('file.minioEndpoint is not configured');
    }
    const minioUrl = new URL(minioEndpoint);

    app.use(
      '/minio-proxy',
      createProxyMiddleware({
        target: minioEndpoint,
        changeOrigin: true,
        pathRewrite: { '^/minio-proxy': '' },
        on: {
          proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('Host', minioUrl.host);
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');

            // Strip ngrok-skip-browser-warning trước khi forward tới MinIO
            const url = new URL(req.url ?? '', 'http://localhost');
            url.searchParams.delete('ngrok-skip-browser-warning');
            proxyReq.path = url.pathname + url.search;
          },
        },
      }),
    );

  }

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
