import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCareerDto {
  @ApiProperty({ example: 'IT - Phần mềm', description: 'Tên ngành nghề' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  iconUrl: string;
}
