import { PartialType } from '@nestjs/swagger';
import { CreateMyjobDto } from './create-myjob.dto';

export class UpdateMyjobDto extends PartialType(CreateMyjobDto) {}
