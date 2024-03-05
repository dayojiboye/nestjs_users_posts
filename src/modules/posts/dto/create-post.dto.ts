import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly body: string;

  @IsArray()
  @IsOptional()
  images: string[];

  // To-Do: Add authorId
}
