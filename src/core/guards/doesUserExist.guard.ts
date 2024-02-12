import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/users.service';
import { UserDto } from 'src/modules/users/dto/user.dto';

@Injectable()
export class DoesUserExist implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: { body: UserDto }) {
    const emailExists = await this.userService.findOneByEmail(
      request.body.email,
    );

    const usernameExists = await this.userService.findOneByUsername(
      request.body.username,
    );

    if (emailExists) {
      throw new ForbiddenException('Email already taken');
    }

    if (usernameExists) {
      throw new ForbiddenException('Username already taken');
    }

    return true;
  }
}
