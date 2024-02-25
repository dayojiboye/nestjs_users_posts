import { IsArray, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  readonly title: string;

  @IsOptional()
  readonly body: string;

  @IsArray()
  @IsOptional()
  images: string[];
}
