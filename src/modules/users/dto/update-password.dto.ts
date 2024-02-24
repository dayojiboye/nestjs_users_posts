import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(6, {
    message: 'Old password must be longer than or equal to 6 characters',
  })
  @IsNotEmpty({ message: 'Old password should not be empty' })
  readonly oldPassword: string;

  @MinLength(6, {
    message: 'New password must be longer than or equal to 6 characters',
  })
  @IsNotEmpty({ message: 'New password should not be empty' })
  readonly newPassword: string;
}
