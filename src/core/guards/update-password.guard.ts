import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UpdatePasswordDto } from 'src/modules/users/dto/update-password.dto';
import { User } from 'src/modules/users/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { USER_NOT_FOUND_MESSAGE } from '../constants';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class UpdatePasswordGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateUpdatePasswordRequest(request);
  }

  private async validateUpdatePasswordRequest(request: {
    body: UpdatePasswordDto;
    user: Omit<User, 'password'>;
  }) {
    const user = await this.usersService.findOneById(request.user.id);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    if (!request.body.oldPassword) {
      throw new UnprocessableEntityException({
        message: 'Old password should not be empty',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    if (request.body.oldPassword.length < 6) {
      throw new UnprocessableEntityException({
        message: 'Old password must be longer than or equal to 6 characters',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    const match = await this.authService.comparePassword(
      request.body.oldPassword,
      user.dataValues.password,
    );

    if (!match) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    return true;
  }
}
