import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class CommentsService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: typeof Comment,
  ) {}

  public async create(
    comment: CreateCommentDto,
    postId: string,
    authorId: string,
  ): Promise<{ message: string; data: Comment }> {
    const newComment = await this.commentRepository.create<Comment>({
      ...comment,
      postId,
      authorId,
    });

    return {
      message: 'Comment added successfully',
      data: newComment,
    };
  }

  public async getPostComment(postId: string): Promise<{
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
      data: comments || [],
    };
  }
}
