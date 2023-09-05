import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { classToPlain } from 'class-transformer';
import { Profile } from 'passport';
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
    profile: Profile,
    done: Function,
  ) {
    const stateParameter = request.query.state;
    const additionalParams = JSON.parse(
      Buffer.from(stateParameter, 'base64').toString('utf-8'),
    );
    try {
      const createUser = this.usersService.createOrUpdate({
        provider: profile.provider,
        email: profile.emails[0].value,
        providerId: profile.id,
        referralCode: await this.usersService.generateReferralCode(),
        referrerId: null,
        password: this.usersService.makeString(32),
        name: `${profile?.name?.givenName} ${profile?.name?.middleName} ${profile?.name?.givenName}`.replace(
          '  ',
          '',
        ),
        accountType: additionalParams?.accountType,
      });

      const user = await this.usersService.findOneByProviderId(profile.id);
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
