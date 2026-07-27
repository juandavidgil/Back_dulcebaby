import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    example: 'cmrjiwq580000ugeka2ezd4jg',
  })
  @IsString()
  planId!: string;

  @ApiProperty({
    example: 'COP',
    enum: ['COP', 'USD'],
  })
  @IsString()
  @IsIn(['COP', 'USD'])
  currency!: 'COP' | 'USD';
}