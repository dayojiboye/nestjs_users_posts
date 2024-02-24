import { Body, Controller, Request, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { UsersService } from './users.service';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdateUserGuard } from 'src/core/guards/update-user.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
}
