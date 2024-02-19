import { COMMENT_REPOSITORY } from 'src/core/constants';
import { Comment } from './comment.entity';

export const commentsProviders = [
  {
    provide: COMMENT_REPOSITORY,
    useValue: Comment,
  },
];
