import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource, envValidationSchema } from './config';
import { UserEntity } from './entity';
import { UserController } from './controller';
import { UserService } from './service';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';

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
  providers: [UserService],
})
export class AppModule {}
