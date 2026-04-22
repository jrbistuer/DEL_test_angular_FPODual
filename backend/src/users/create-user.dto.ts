import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** DTO for creating a new User. */
export class CreateUserDto {
  /** Unique username handle. */
  @IsString()
  @IsNotEmpty()
  username: string;

  /** Display name. */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Valid email address (must be unique in the database). */
  @IsEmail()
  email: string;
}
