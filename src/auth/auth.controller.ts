import { EmailConfirmationService } from './../services/email-confirmation.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-guard';
import { AuthGuard } from '@nestjs/passport';
import { AccountTypes } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    const result = this.authService.signUp(signUpDto);
    return result;
  }

  @Post('rider/sign-up')
  signUpRider(@Body() signUpDto: SignUpDto) {
    signUpDto.accountType = AccountTypes.rider;
    const result = this.authService.signUp(signUpDto);
    return result;
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    const result = this.authService.signIn(signInDto);
    return result;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res) {
    // handles the Google OAuth2 callback
    const jwt = req.user;
    if (jwt) res.send(jwt);
    else
      res.send({
        message: 'error',
      });
  }

  @Post('verify-account')
  verifyAccount(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = this.authService.verifyRegistrationOtp(verifyOtpDto);
    return result;
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const response = this.authService.verifyRegistrationOtp(verifyOtpDto);
    return response;
  }

  @Post('forgot-password')
  forgotPassword(@Body() signUpDto: SignUpDto) {
    const response = this.authService.forgotPassword(signUpDto);
    return response;
  }

  @Post('confirm-email')
  async confirm(@Body() confirmationData: ConfirmEmailDto) {
    const email = await this.emailConfirmationService.decodeConfirmationToken(
      confirmationData.token,
    );
    await this.emailConfirmationService.confirmEmail(email);
  }

  @Post('resend-confirmation-link')
  @UseGuards(JwtAuthGuard)
  async resendConfirmationLink(@Req() request) {
    await this.emailConfirmationService.resendConfirmationLink(request.user.id);
  }
}
