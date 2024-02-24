import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/modules/users/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { USER_NOT_FOUND_MESSAGE } from '../constants';

@Injectable()
export class UpdateUserGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateUpdateUserRequest(request);
  }

  private async validateUpdateUserRequest(request: {
    user: Omit<User, 'password'>;
  }) {
    const user = await this.usersService.findOneById(request.user.id);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    return true;
  }
}
