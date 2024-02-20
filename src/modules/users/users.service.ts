import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_NOT_FOUND_MESSAGE, USER_REPOSITORY } from 'src/core/constants';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateNameDto } from './dto/update-name.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
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
}
