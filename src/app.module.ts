import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource, envValidationSchema } from './config';
import { UserEntity } from './entity';
import { UserController } from './controller';
import { UserService } from './service';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { default as Redis } from "ioredis"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/api/v1/upload',
      rootPath: process.env.UPLOAD_LOCATION,
    }),
    TypeOrmModule.forRoot(dataSource.options),
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({ secret: process.env.JWT_SECRET_KEY }),
  ],
  controllers: [UserController],
  providers: [
    {
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          port: configService.get('REDIS_PORT'), // Redis port
          host: configService.get('REDIS_HOST'), // Redis host
          // username: "default", // needs Redis >= 6
          // password: "my-top-secret",
          // db: 0, // Defaults to 0
        });;
      },
      provide: 'REDIS',
    }, UserService],
})
export class AppModule { }
