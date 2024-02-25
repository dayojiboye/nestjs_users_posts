import { Inject, Injectable } from '@nestjs/common';
import {
  DEFAULT_SUCCESS_MESSAGE,
  ORDER_BY,
  POST_REPOSITORY,
} from 'src/core/constants';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './post.entity';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: typeof Post,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async create(
    post: CreatePostDto,
    authorId: string,
    files: Array<Express.Multer.File>,
  ): Promise<{ message: string; data: Post }> {
    if (files) {
      const uploadResponse = await Promise.all(
        files.map((file) => this.cloudinaryService.uploadFile(file)),
      );

      post.images = uploadResponse.map((response) => response.url);
    }

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
    body: UpdatePostDto,
    files: Array<Express.Multer.File>,
  ): Promise<{ message: string; data: Post }> {
    if (files) {
      const uploadResponse = await Promise.all(
        files.map((file) => this.cloudinaryService.uploadFile(file)),
      );

      body.images = uploadResponse.map((response) => response.url);
    }

    await this.postRepository.update<Post>(body, {
      where: { id: postId },
    });

    const editedPost = await this.postRepository.findByPk<Post>(postId);

    return {
      message: 'Post updated successfully',
      data: editedPost,
    };
  }

  public async deletePost(
    postId: string,
  ): Promise<{ message: string; data: object }> {
    await this.postRepository.destroy({ where: { id: postId } });

    return {
      message: 'Post deleted successfully',
      data: {},
    };
  }
}
