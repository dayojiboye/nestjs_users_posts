import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

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
  public async getPostComment(@Param('postId') postId: string) {
    return await this.commentsService.getPostComment(postId);
  }
}
