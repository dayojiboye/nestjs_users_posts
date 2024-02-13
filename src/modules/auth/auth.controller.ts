import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dto/user.dto';
import { DoesUserExist } from 'src/core/guards/doesUserExist.guard';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  public async login(@Body() user: LoginDto) {
    return await this.authService.login(user.email, user.password);
  }

  @UseGuards(DoesUserExist)
  @Post('register')
  public async signUp(@Body() newUser: UserDto) {
    return await this.authService.register(newUser);
  }
}
