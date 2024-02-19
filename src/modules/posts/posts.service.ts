import { Inject, Injectable } from '@nestjs/common';
import {
  DEFAULT_SUCCESS_MESSAGE,
  ORDER_BY,
  POST_REPOSITORY,
} from 'src/core/constants';
import { PostDto } from './dto/create-post.dto';
import { Post } from './post.entity';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: typeof Post,
  ) {}

  public async create(
    post: PostDto,
    authorId: string,
  ): Promise<{ message: string; data: Post }> {
    const newPost = await this.postRepository.create<Post>({
      ...post,
      authorId,
    });

    return {
      message: 'Post created successfully',
      data: newPost,
    };
  }

  public async getAllPosts(
    userId?: string,
  ): Promise<{ message: string; data: Post[] }> {
    const posts = await this.postRepository.findAll<Post>({
      where: userId ? { authorId: userId } : undefined,
      order: [['updatedAt', ORDER_BY.DESC]],
      attributes: {
        include: [
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM Comments WHERE Comments.postId = Post.id)',
            ),
            'totalComments',
          ],
        ],
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username'],
        },
      ],
    });

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: posts,
    };
  }

  public async getPostById(
    postId: string,
  ): Promise<{ message: string; data: Post | object }> {
    const post = await this.postRepository.findByPk<Post>(postId, {
      attributes: {
        include: [
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM Comments WHERE Comments.postId = Post.id)',
            ),
            'totalComments',
          ],
        ],
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username'],
        },
        // {
        //   model: Comment,
        //   as: 'comments',
        //   include: [
        //     {
        //       model: User,
        //       as: 'author',
        //       attributes: ['id', 'username'],
        //     },
        //   ],
        // },
      ],
      // order: [[Post.associations.comments, 'createdAt', 'DESC']],
    });

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: post ?? {},
    };
  }
}
