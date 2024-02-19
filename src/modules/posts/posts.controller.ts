import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { PostDto } from './dto/create-post.dto';

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  public async createPost(@Body() newPost: PostDto, @Request() req) {
    return await this.postsService.create(newPost, req.user.id);
  }

  @Get('')
  public async getAllPosts(@Query('userId') userId: string) {
    return await this.postsService.getAllPosts(userId);
  }

  @Get(':postId')
  public async getPost(@Param('postId') postId: string) {
    return await this.postsService.getPostById(postId);
  }
}
