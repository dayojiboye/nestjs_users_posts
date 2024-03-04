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
    const cachedData = await this.cacheManager.get<Post>(postId);

    if (cachedData) {
      console.log('Got post from cache');
      return {
        message: DEFAULT_SUCCESS_MESSAGE,
        data: cachedData,
      };
    }

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

    await this.cacheManager.set(postId, post);
    console.log('Stored post in cache');

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: post,
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
  ): Promise<{ message: string; data: number }> {
    const cacheKey = `post_views_${postId}`;
    const post = await this.postRepository.findByPk<Post>(postId);
    if (!post) {
      throw new NotFoundException(POST_NOT_FOUND_MESSAGE);
    }

    const cachedData = await this.cacheManager.get<string[]>(cacheKey);

    // Check if there's a cached data for the post views
    if (cachedData) {
      // Return cached data only if userId exists in cached data
      if (cachedData.some((id) => id === userId)) {
        console.log('Retrieved from cache');
        return {
          message: DEFAULT_SUCCESS_MESSAGE,
          data: cachedData.length ?? 0,
        };
      }
    }

    // Only update views if user is not author of post
    if (post.dataValues.authorId !== userId) {
      // Check if views isn't null in DB and return an empty array if it is
      const DBViews = post.views ? post.views : [];
      // Check if userId exists in post views
      const hasViewed = DBViews.some((id) => id === userId);
      // If userId exists, return post views or add userId if it doesn't exist
      const updatedViews: string[] = hasViewed ? DBViews : [...DBViews, userId];
      await this.cacheManager.set(cacheKey, updatedViews);
      console.log('Views updated in cache');
      // Update post views in DB if userId doesn't exist
      if (!hasViewed) {
        post.views = updatedViews;
        await post.save();
      }
    }

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: post.views.length ?? 0,
    };
  }
}
