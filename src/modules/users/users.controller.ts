import {
  Body,
  Controller,
  Request,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { UsersService } from './users.service';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdateUserGuard } from 'src/core/guards/update-user.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateImageDto } from './dto/update-image.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(UpdateUserGuard)
  @UseGuards(AuthGuard)
  @Put('update/name')
  public async updateName(@Body() updatedUser: UpdateNameDto, @Request() req) {
    return await this.usersService.updateName(updatedUser, req.user.id);
  }

  // @UseGuards(UpdatePasswordGuard)
  @UseGuards(AuthGuard)
  @Put('update/password')
  public async updatePassword(
    @Body() updatedPassword: UpdatePasswordDto,
    @Request() req,
  ) {
    return await this.usersService.updatePassword(updatedPassword, req.user.id);
  }

  @UseGuards(UpdateUserGuard)
  @UseGuards(AuthGuard)
  @Put('update/profile-picture')
  @UseInterceptors(FileInterceptor('imageUrl'))
  public async updateUserImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateImageDto: UpdateImageDto,
    @Request() req,
  ) {
    return this.usersService.updateImage(file, updateImageDto, req.user.id);
  }
}
