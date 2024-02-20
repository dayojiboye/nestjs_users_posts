import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(6)
  @IsNotEmpty()
  readonly oldPassword: string;

  @MinLength(6)
  @IsNotEmpty()
  readonly newPassword: string;
}
