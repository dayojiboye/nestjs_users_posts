import { Body, Controller, Request, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { UsersService } from './users.service';
import { UpdateNameDto } from './dto/update-name.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Put('update/name')
  public async updateName(@Body() updatedUser: UpdateNameDto, @Request() req) {
    return await this.usersService.updateName(updatedUser, req.user.id);
  }
}
