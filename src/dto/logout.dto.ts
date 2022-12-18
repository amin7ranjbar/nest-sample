import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    example: 'admin@gmail.com',
  })
  @IsJWT()
  @IsNotEmpty()
  token: string;
}
