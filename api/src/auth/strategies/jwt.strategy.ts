import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface IJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    let jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      jwtSecret = process.env.JWT_SECRET;
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    
    this.logger.log('JWT Strategy initialized with secret key');
  }

  validate(payload: IJwtPayload): { id: string; email: string } {
    this.logger.log(`JWT payload validated for user: ${payload.email}`);
    return { id: payload.sub, email: payload.email };
  }
}
