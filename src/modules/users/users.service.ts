import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import {
  INVALID_USER_CREDENTIALS_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
  USER_REPOSITORY,
} from 'src/core/constants';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  public async create(user: UserDto): Promise<User> {
    return await this.userRepository.create<User>(user);
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { email } });
  }

  public async findOneById(id: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { id } });
  }

  public async findOneByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { username } });
  }

  public async updateName(
    body: UpdateNameDto,
    userId: string,
  ): Promise<{ message: string; data: User }> {
    const userToUpdate = await this.findOneById(userId);

    if (!userToUpdate) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    let editedUser: any = await this.userRepository.update<User>(body, {
      where: { id: userId },
    });

    editedUser = await this.findOneById(userId);

    return {
      message: 'User updated successfully',
      data: editedUser,
    };
  }

  public async updatePassword(
    body: UpdatePasswordDto,
    userId: string,
  ): Promise<{ message: string; data: object }> {
    const userToUpdate = await this.findOneById(userId);

    if (!userToUpdate) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    if (userToUpdate.dataValues.password === body.newPassword) {
      throw new ForbiddenException(
        "New password value can't be the same with current password",
      );
    }

    const match = await this.authService.comparePassword(
      body.oldPassword,
      userToUpdate.password,
    );

    if (!match) {
      throw new UnauthorizedException(INVALID_USER_CREDENTIALS_MESSAGE);
    }

    const hashedPassword = await this.authService.hashPassword(
      body.newPassword,
    );

    await this.userRepository.update<User>(
      {
        password: hashedPassword,
      },
      {
        where: { id: userId },
      },
    );

    return {
      message: 'Password updated successfully',
      data: {},
    };
  }
}
