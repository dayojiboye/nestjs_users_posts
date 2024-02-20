import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { COMMENT_REPOSITORY } from '../constants';
import { User } from 'src/modules/users/user.entity';
import { Comment } from 'src/modules/comments/comment.entity';

@Injectable()
export class CommentGuard implements CanActivate {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: typeof Comment,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateCommentRequest(request);
  }

  private async validateCommentRequest(request: {
    params: { commentId: string };
    user: Omit<User, 'password'>;
  }) {
    const comment = await this.commentRepository.findByPk<Comment>(
      request.params.commentId,
    );

    if (!comment) {
      throw new NotFoundException('No comment found');
    }

    if (comment.dataValues.authorId !== request.user.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}
