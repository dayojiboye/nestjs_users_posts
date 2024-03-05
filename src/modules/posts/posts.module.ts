import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { postsProviders } from './posts.provider';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  providers: [PostsService, ...postsProviders],
  controllers: [PostsController],
  imports: [CloudinaryModule],
  exports: [PostsService],
})
export class PostsModule {}
