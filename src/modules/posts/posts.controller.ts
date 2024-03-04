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
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostGuard } from 'src/core/guards/post.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { validateMultiImages } from 'src/core/pipes/multi-images-validator.pipe';
import { validMultiImagesMimeTypes } from 'src/core/constants';
import { UpdatePostDto } from './dto/update-post.dto';
// import { CacheInterceptor } from '@nestjs/cache-manager';

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(200)
  public async createPost(
    @Body() newPost: CreatePostDto,
    @Request() req,
    @UploadedFiles(validateMultiImages(validMultiImagesMimeTypes))
    files: Array<Express.Multer.File>,
  ) {
    return await this.postsService.create(newPost, req.user.id, files);
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
  @UseInterceptors(AnyFilesInterceptor())
  public async updatePost(
    @UploadedFiles(validateMultiImages(validMultiImagesMimeTypes))
    files: Array<Express.Multer.File>,
    @Param('postId') postId: string,
    @Body() updatedPost: UpdatePostDto,
  ) {
    return await this.postsService.updatePost(postId, updatedPost, files);
  }

  @UseGuards(PostGuard)
  @Delete('delete/:postId')
  public async deletePost(@Param('postId') postId: string) {
    return await this.postsService.deletePost(postId);
  }

  // @UseInterceptors(CacheInterceptor)
  @Get('view/:postId')
  public async viewPost(@Param('postId') postId: string, @Req() req) {
    return await this.postsService.viewPost(postId, req.user.id);
  }
}
