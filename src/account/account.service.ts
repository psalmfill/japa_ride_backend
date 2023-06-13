import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './../auth/auth.service';
import { UpdateUserDto } from './../users/dto/update-user.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AccountService {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  async getProfile(id: string): Promise<UserModel> {
    return this.usersService.findOne(id);
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserModel> {
    //  remove the password
    const { password, ...data } = updateUserDto;
    return this.usersService.update(id, data);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    if (
      changePasswordDto.password == undefined ||
      changePasswordDto.password == ''
    ) {
      throw new HttpException(
        'Password Field is required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (
      changePasswordDto.passwordConfirmation == undefined ||
      changePasswordDto.passwordConfirmation == ''
    ) {
      throw new HttpException(
        'Password Confirmation Field is required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (
      changePasswordDto.currentPassword == undefined ||
      changePasswordDto.currentPassword == ''
    ) {
      throw new HttpException(
        'Current password Field is required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (changePasswordDto.password !== changePasswordDto.passwordConfirmation) {
      throw new HttpException(
        'Password and Password Confirmation does not match',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const user = await this.usersService.findOne(id);
    // check currentPassword
    const isValid = await this.authService.comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isValid) {
      throw new HttpException(
        'Current password is incorrect, Please use reset password instead',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const hashPassword = await this.authService.hashPassword(
      changePasswordDto.password,
    );

    // update the password
    const result = await this.usersService.update(id, {
      password: hashPassword,
    });
    if (result) {
      return {
        message: 'Password was changed successfully!',
      };
    }
    throw new HttpException(
      'Unable to change your password ',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  async resetPassword(id: string, resetPasswordDto: ResetPasswordDto) {
    if (
      resetPasswordDto.password == undefined ||
      resetPasswordDto.password == ''
    ) {
      throw new HttpException(
        'Password Field is required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (
      resetPasswordDto.passwordConfirmation == undefined ||
      resetPasswordDto.passwordConfirmation == ''
    ) {
      throw new HttpException(
        'Password Confirmation Field is required',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (resetPasswordDto.password !== resetPasswordDto.passwordConfirmation) {
      throw new HttpException(
        'Password and Password Confirmation does not match',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const user = await this.usersService.findOne(id);

    const hashPassword = await this.authService.hashPassword(
      resetPasswordDto.password,
    );

    // update the password
    const result = await this.usersService.update(id, {
      password: hashPassword,
    });
    if (result) {
      return {
        message: 'Password was setup successfully!',
      };
    }
    throw new HttpException(
      'Unable to setup your password ',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
