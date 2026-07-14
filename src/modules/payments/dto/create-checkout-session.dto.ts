import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    example: 'cmrjiwq580000ugeka2ezd4jg',
  })
  @IsString()
  planId!: string;

}