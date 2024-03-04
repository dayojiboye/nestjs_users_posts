import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: typeof Post,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
      ],
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

  public async viewPost(
    postId: string,
    userId: string,
  ): Promise<{ message: string; data: Post }> {
    const cacheKey = `post_views_${postId}`;

    // Cache Post response with CacheInterceptor in controller
    // Find a way to show updated views with the cached response
    // https://stackoverflow.com/questions/54087231/how-can-i-count-the-view-of-a-specific-post-by-a-user-count-every-user-just-on
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

    if (!post) {
      throw new NotFoundException(POST_NOT_FOUND_MESSAGE);
    }

    if (post.dataValues.authorId !== userId) {
      await this.cacheManager.set(cacheKey, post.dataValues.views + 1);
      const cachedData = await this.cacheManager.get<number>(cacheKey);
      console.log('Data set to cache', cachedData);
      post.views = cachedData;
      await post.save();
    }

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: post,
    };
  }
}
