import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DEFAULT_SUCCESS_MESSAGE,
  ORDER_BY,
  POST_NOT_FOUND_MESSAGE,
  POST_REPOSITORY,
} from 'src/core/constants';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './post.entity';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: typeof Post,
  ) {}

  public async create(
    post: CreatePostDto,
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
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username'],
            },
          ],
        },
      ],
      order: [[Post.associations.comments, 'createdAt', 'DESC']],
    });

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: post ?? {},
    };
  }

  public async updatePost(
    postId: string,
    userId: string,
    body: CreatePostDto,
  ): Promise<{ message: string; data: Post }> {
    const postToUpdate = await this.postRepository.findByPk<Post>(postId);

    if (!postToUpdate) {
      throw new NotFoundException(POST_NOT_FOUND_MESSAGE);
    }

    if (postToUpdate.dataValues.authorId !== userId) {
      throw new ForbiddenException();
    }

    let editedPost: any = await this.postRepository.update<Post>(body, {
      where: { id: postId },
    });

    editedPost = await this.postRepository.findByPk<Post>(postId);

    return {
      message: 'Post updated successfully',
      data: editedPost,
    };
  }

  public async deletePost(
    postId: string,
    userId: string,
  ): Promise<{ message: string; data: object }> {
    const postToDelete = await this.postRepository.findByPk<Post>(postId);

    if (!postToDelete) {
      throw new NotFoundException(POST_NOT_FOUND_MESSAGE);
    }

    if (postToDelete.dataValues.authorId !== userId) {
      throw new ForbiddenException();
    }

    await this.postRepository.destroy({ where: { id: postId } });

    return {
      message: 'Post deleted successfully',
      data: {},
    };
  }
}
