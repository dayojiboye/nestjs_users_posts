import { IsOptional, IsString } from 'class-validator';

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  imageUrl: string;
}
