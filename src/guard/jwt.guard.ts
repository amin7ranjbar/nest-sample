import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers['authorization'];
      if (!authorization || Array.isArray(authorization)) {
        throw new Error('Invalid Authorization Header');
      }
      const token = authorization.replace('Bearer', '').trim();
      const user = this.jwtService.verify(token);
      request.user = user;
      return true;
    } catch (e) {
      return false;
    }
  }
}
