import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from './../users/users.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hotp } from 'otplib';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  private secret = '';

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.secret = configService.get<string>('OTP_SECRET');
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.usersService.create({
      email: signUpDto.email,
      password: await this.hashPassword(signUpDto.password),
      name: signUpDto.name,
      phoneNumber: signUpDto.phoneNumber,
      accountType: signUpDto.accountType,
    });
    // todo generate and send otp
    hotp.options = { digits: 4 };
    const token = hotp.generate(`${this.secret}${user.email}`, user.otpCounter);
    // await this.mailerService
    //   .sendMail({
    //     to: user.email, // list of receivers
    //     from: 'noreply@breeksbnb.com', // sender address
    //     subject: 'Your Verification Token', // Subject line
    //     text: `Your OTP verification code is ${token}.`, // plaintext body
    //     //   html: '<b>welcome</b>', // HTML body content
    //   })
    //   .then(() => {})
    //   .catch(() => { });

    return {
      user,
      message: `Your account verification code has been sent to ${signUpDto.email}:  ${token}`,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { password, ...user } = await this.usersService.findOneByEmail(
      signInDto.email,
    );
    const validPassword = await this.comparePassword(
      signInDto.password,
      password,
    );
    if (!user || !validPassword) {
      throw new HttpException(
        'Could not authenticate user with provided credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const payload = { user: user, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
  async verifyRegistrationOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.findOneByEmail(verifyOtpDto.email);
    if (!user) {
      throw new HttpException('Account was not found', HttpStatus.NOT_FOUND);
    }
    hotp.options = { digits: 4 };

    const isValid = hotp.verify({
      token: `${verifyOtpDto.otp}`,
      secret: `${this.secret}${user.email}`,
      counter: user.otpCounter,
    });
    if (!isValid) {
      throw new HttpException(
        'Invalid token was provided',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      await this.usersService.update(user.id, {
        otpCounter: user.otpCounter + 1,
        phoneNumberVerifiedAt: new Date(),
      });
      const payload = { user: user, userId: user.id };
      const jwt: string = this.jwtService.sign(payload);
      return {
        user,
        token: jwt,
      };
    }
  }

  async forgotPassword(signUpDto: SignUpDto) {
    const user = await this.usersService.findOneByEmail(signUpDto.email);
    if (!user) {
      throw new HttpException(
        'Account with email was not found',
        HttpStatus.NOT_FOUND,
      );
    }
    //   generate and send otp code for account verification
    hotp.options = { digits: 4 };

    // generate otp code using email
    const token = hotp.generate(`${this.secret}${user.email}`, user.otpCounter);

    return {
      user,
      message: `OTP Verification code has been sent to ${user.email} ${token}`,
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async hashPassword(password: string) {
    const result = await bcrypt.hash(password, 12);
    return result;
  }

  async comparePassword(password: string, hash: string) {
    const result = await bcrypt.compare(password, hash);
    return result;
  }
}
