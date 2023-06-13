import { ApiProperty } from '@nestjs/swagger';

export class StartConversationDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  receiverId: string;

  @ApiProperty()
  senderId: string;
}
