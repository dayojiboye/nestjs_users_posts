import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { POST_NOT_FOUND_MESSAGE, POST_REPOSITORY } from '../constants';
import { User } from 'src/modules/users/user.entity';
import { Post } from 'src/modules/posts/post.entity';

@Injectable()
export class PostGuard implements CanActivate {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: typeof Post,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validatePostRequest(request);
  }

  private async validatePostRequest(request: {
    params: { postId: string };
    user: Omit<User, 'password'>;
  }) {
    const post = await this.postRepository.findByPk<Post>(
      request.params.postId,
    );

    if (!post) {
      throw new NotFoundException(POST_NOT_FOUND_MESSAGE);
    }

    if (post.dataValues.authorId !== request.user.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}
