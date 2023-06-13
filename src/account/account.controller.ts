import { CreateUserDto } from './../users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AccountService } from './account.service';
import { JwtAuthGuard } from './../auth/guards/jwt-guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('JWT')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req) {
    return this.accountService.getProfile(req.user.id).then((res) => {
      const { password, ...user } = res;
      return user;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @ApiResponse({ type: CreateUserDto })
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.accountService
      .updateProfile(req.user.id, updateUserDto)
      .then((res) => {
        const { password, ...user } = res;
        return user;
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.accountService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  resetPassword(@Req() req, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.accountService.resetPassword(req.user.id, resetPasswordDto);
  }
}
