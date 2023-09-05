import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'), // <- Replace this with your client secret
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['emails', 'name'],
      proxy: true,
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
      const createUser = await this.usersService.createOrUpdate({
        provider: profile.provider,
        email: profile.emails[0].value,
        providerId: profile.id,
        referralCode: await this.usersService.generateReferralCode(),
        referrerId: undefined,
        password: this.usersService.makeString(32),
        name: `${profile.name.givenName} ${profile.name.middleName} ${profile.name.givenName}`.replace(
          '  ',
          '',
        ),
        accountType: additionalParams?.accountType,
      });

      const user = await this.usersService.findOneByProviderId(profile.id);
      const payload = { user: user, userId: user.id };
      const jwt: string = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      });
      done(null, {
        user,
        token: jwt,
      });
    } catch (err) {
      done(err, false);
    }
  }
}
