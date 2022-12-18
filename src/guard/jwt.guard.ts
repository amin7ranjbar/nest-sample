import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, @Inject("REDIS") private redisClient: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers['authorization'];
      if (!authorization || Array.isArray(authorization)) {
        throw new Error('Invalid Authorization Header');
      }
      const token = authorization.replace('Bearer', '').trim();
      const checkTokenInRedis = await this.redisClient.get(token);
      const user = this.jwtService.verify(token);
      if (checkTokenInRedis != user.id) {
        return false;
      }
      request.user = user;
      return true;
    } catch (e) {
      return false;
    }
  }
}
