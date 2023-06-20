import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { classToPlain } from 'class-transformer';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'), // <- Replace this with your client secret
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    data,
    done: Function,
  ) {
    try {
      const name = data.name ? data.name.split('') : null;
      const createUser = this.usersService.createOrUpdate({
        provider: data.provider,
        email: data.emails[0].value,
        providerId: data.id,
        referralCode: await this.usersService.generateReferralCode(),
        referrerId: null,
        password: null,
        firstName: name ? name[0] : '',
        lastName: name ? name[name.length - 1] : '',
      });

      const user = await this.usersService.findOneByProviderId(data.id);
      const payload = { user: user, userId: user.id };
      const jwt: string = this.jwtService.sign(payload);
      done(null, {
        user,
        token: jwt,
      });
    } catch (err) {
      done(err, false);
    }
  }
}
