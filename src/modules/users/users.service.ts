import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import {
  USER_NOT_FOUND_MESSAGE,
  USER_REPOSITORY,
  validMimeTypes,
} from 'src/core/constants';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthService } from '../auth/auth.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
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
    await this.userRepository.update<User>(body, {
      where: { id: userId },
    });

    const editedUser = await this.findOneById(userId);

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

    if (body.oldPassword === body.newPassword) {
      throw new ForbiddenException(
        'Old password and new password values can not be the same',
      );
    }

    const match = await this.authService.comparePassword(
      body.oldPassword,
      userToUpdate.password,
    );

    if (!match) {
      throw new UnauthorizedException('Current password is incorrect');
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

  public async updateImage(
    file: Express.Multer.File,
    body: UpdateImageDto,
    userId: string,
  ): Promise<{ message: string; data: User }> {
    // Might as well move all these checks to an utility function
    if (!file) {
      throw new UnprocessableEntityException({
        message: 'Image field must not be empty',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    // Check if the file is an image
    if (!file.mimetype.startsWith('image')) {
      throw new UnprocessableEntityException({
        message: 'Sorry, this file is not an image. Please try again',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    // Check if image format is JPG | JPEG | PNG
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new UnprocessableEntityException({
        message: 'Invalid image file format',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    // Check if the size of the image is not more than 3MB
    if (file.size > 3000000) {
      throw new UnprocessableEntityException({
        message: 'Please upload an image size not more than 3MB',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    // const uploadedImage = await this.cloudinaryService
    //   .uploadFile(file)
    //   .then((r) => console.log(r))
    //   .catch(() => {
    //     throw new BadRequestException('Invalid file type.');
    //   });

    const imageResponse = await this.cloudinaryService.uploadFile(file);
    body.imageUrl = imageResponse.url;

    await this.userRepository.update<User>(body, {
      where: { id: userId },
    });

    const editedUser = await this.findOneById(userId);

    return {
      message: 'Profile picture updated successfully',
      data: editedUser,
    };
  }
}
