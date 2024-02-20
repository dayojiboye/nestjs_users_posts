import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentGuard } from 'src/core/guards/comment.guard';

@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('create/:postId')
  public async createComment(
    @Body() newComment: CreateCommentDto,
    @Param('postId') postId: string,
    @Request() req,
  ) {
    return await this.commentsService.create(newComment, postId, req.user.id);
  }

  @Get(':postId')
  public async getPostComments(@Param('postId') postId: string) {
    return await this.commentsService.getPostComments(postId);
  }

  @UseGuards(CommentGuard)
  @Delete('delete/:commentId')
  public async deleteComment(@Param('commentId') commentId: string) {
    return await this.commentsService.deleteComment(commentId);
  }
}
