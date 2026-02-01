import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // 4. Validation Success!
  // This method runs if the token is valid.
  // Whatever you return here is injected into the Request object as `req.user`.
  async validate(payload: any) {
    // payload = { sub: 'uuid...', username: 'moni', iat: ..., exp: ... }
    return { userId: payload.sub, username: payload.username };
  }
}
