import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
    @ApiProperty()
    currentPassword: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    passwordConfirmation: string;

}