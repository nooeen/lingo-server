import { ApiProperty } from '@nestjs/swagger';

export class LoginBodyDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Access token',
  })
  access_token?: string;

  @ApiProperty({ type: String, required: false })
  email?: string;

  @ApiProperty({ type: String, required: false })
  displayName?: string;

  @ApiProperty({ type: String, required: false })
  avatar?: string;
}
