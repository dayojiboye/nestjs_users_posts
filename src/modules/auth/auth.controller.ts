import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dto/user.dto';
import { DoesUserExist } from 'src/core/guards/does-user-exist.guard';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  public async login(@Body() user: LoginDto) {
    return await this.authService.login(user.email, user.password);
  }

  @UseGuards(DoesUserExist)
  @Post('register')
  @HttpCode(200)
  public async signUp(@Body() newUser: UserDto) {
    return await this.authService.register(newUser);
  }
}
