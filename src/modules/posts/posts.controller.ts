import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostGuard } from 'src/core/guards/post.guard';

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  public async createPost(@Body() newPost: CreatePostDto, @Request() req) {
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

  @UseGuards(PostGuard)
  @Put('update/:postId')
  public async updatePost(
    @Param('postId') postId: string,
    @Body() updatedPost: CreatePostDto,
  ) {
    return await this.postsService.updatePost(postId, updatedPost);
  }

  @UseGuards(PostGuard)
  @Delete('delete/:postId')
  public async deletePost(@Param('postId') postId: string) {
    return await this.postsService.deletePost(postId);
  }
}
