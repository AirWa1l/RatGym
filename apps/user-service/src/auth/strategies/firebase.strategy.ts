import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Extract Firebase token from header if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Validate with Firebase
        const user = await this.authService.validateFirebaseToken(token);
        return user;
      } catch (error) {
        // If Firebase validation fails, try JWT validation
        if (payload && payload.sub) {
          return {
            uid: payload.sub,
            email: payload.email,
            role: payload.role,
          };
        }
        throw new UnauthorizedException('Invalid token');
      }
    }

    // Fallback to JWT payload
    if (payload && payload.sub) {
      return {
        uid: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }

    throw new UnauthorizedException('No valid authentication found');
  }
}
