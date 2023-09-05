import { ApiProperty } from '@nestjs/swagger';
export class SocialSignInDto {
  @ApiProperty({
    description: 'the account you are trying to sign in, user, recycler, agent',
    required: true,
  })
  accountType: string;
}
