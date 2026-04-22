import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/** DTO for partially updating an existing User. */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
