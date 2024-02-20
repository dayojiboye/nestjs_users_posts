import { IsNotEmpty } from 'class-validator';

export class UpdateNameDto {
  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;
}
