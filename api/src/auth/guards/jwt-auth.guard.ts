import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

// Define interface for user to avoid any types
interface IUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

// Define type for error and info objects
type AuthError = Error & { message?: string };
interface IAuthInfo {
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
    this.logger.log('JwtAuthGuard initialized');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    this.logger.debug(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    if (authHeader) {
      // Split this line to avoid line length issues
      const isValidFormat =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ');
      this.logger.debug(
        `Auth header format: ${isValidFormat ? 'Valid Bearer format' : 'Invalid format'}`,
      );
    }

    return super.canActivate(context);
  }

  // Keep original method signature to match the base class
  handleRequest<TUser = IUser>(
    err: AuthError | null,
    user: TUser | false,
    info?: IAuthInfo,
    _context?: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err ?? !user) {
      this.logger.error(
        `Authentication failed: ${err?.message ?? info?.message ?? 'Unknown error'}`,
      );
      throw err ?? new UnauthorizedException('Authentication failed');
    }

    if (user && typeof user === 'object' && 'email' in user) {
      this.logger.debug(
        `Authentication successful for user: ${(user as { email: string }).email}`,
      );
    }

    return user;
  }
}
