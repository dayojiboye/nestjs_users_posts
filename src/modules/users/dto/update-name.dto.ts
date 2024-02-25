import { IsOptional } from 'class-validator';

export class UpdateNameDto {
  @IsOptional()
  readonly firstName: string;

  @IsOptional()
  readonly lastName: string;
}
