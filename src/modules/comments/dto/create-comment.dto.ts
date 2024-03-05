import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  readonly body: string;

  // To-Do: add authorId and postId
}
