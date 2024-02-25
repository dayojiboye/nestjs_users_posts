import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty()
  readonly email: string;

  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;

  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @MinLength(3)
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsOptional()
  imageUrl: string;
}
