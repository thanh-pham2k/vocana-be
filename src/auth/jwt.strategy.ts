import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "s8JXf2QwPNyV8R!aZ4u6@3hB9KmE1tLqD7$gWv#pFzHnUcXsOjIrT0Md5LyCeQa", // This should match the secret in AuthService
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
} 