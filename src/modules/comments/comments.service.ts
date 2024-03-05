import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  COMMENT_REPOSITORY,
  DEFAULT_SUCCESS_MESSAGE,
  ORDER_BY,
} from 'src/core/constants';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';
import { MailService } from '../mail/mail.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: typeof Comment,
    private readonly mailService: MailService,
    private readonly postsService: PostsService,
  ) {}

  public async create(
    comment: CreateCommentDto,
    postId: string,
    authorId: string,
    authorUsername: string,
  ): Promise<{ message: string; data: Comment }> {
    const newComment = await this.commentRepository.create<Comment>({
      ...comment,
      postId,
      authorId,
    });

    const associatedPost = await this.postsService.getPostById(postId);
    const {
      email: postAuthorEmail,
      firstName: postAuthorFirstName,
      id: postAuthorId,
    } = associatedPost.data.author;

    // Only send mail if comment author is not the same with post author
    if (associatedPost && authorId !== postAuthorId) {
      const emailResponse = await this.mailService.sendCommentNotification({
        postAuthorEmail,
        postAuthorFirstName,
        postTitle: associatedPost.data.title,
        commentAuthorUsername: authorUsername,
      });
      this.logger.log({ emailJobId: emailResponse.jobId });
    }

    return {
      message: 'Comment added successfully',
      data: newComment,
    };
  }

  public async getPostComments(postId: string): Promise<{
    message: string;
    data: Comment[] | object;
  }> {
    const comments = await this.commentRepository.findAll<Comment>({
      where: { postId },
      order: [['createdAt', ORDER_BY.DESC]],
      attributes: {
        include: [
          [Sequelize.col('author.username'), 'authorUsername'],
          [Sequelize.col('post.title'), 'postTitle'],
        ],
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: [],
        },
        {
          model: Post,
          as: 'post',
          attributes: [],
        },
      ],
    });

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: comments ?? [],
    };
  }

  public async deleteComment(
    commentId: string,
  ): Promise<{ message: string; data: object }> {
    await this.commentRepository.destroy({ where: { id: commentId } });

    return {
      message: 'Comment deleted successfully',
      data: {},
    };
  }
}
