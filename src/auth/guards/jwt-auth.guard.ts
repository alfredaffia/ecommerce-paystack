import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/**
 * JWT Authentication Guard
 * Protects routes by requiring a valid JWT token
 * Returns 401 Unauthorized instead of crashing when token is missing/invalid
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handle authentication errors gracefully
   * Returns 401 instead of crashing the server
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Log authentication attempts for debugging
    const request = context.switchToHttp().getRequest();
    const endpoint = `${request.method} ${request.url}`;

    if (err || !user) {
      this.logger.warn(`Unauthorized access attempt to ${endpoint}: ${info?.message || 'No token provided'}`);
      throw err || new UnauthorizedException('Authentication required. Please provide a valid JWT token.');
    }

    this.logger.log(`Authenticated user ${user.id} accessing ${endpoint}`);
    return user;
  }
}
