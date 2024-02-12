/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../users/dto/user.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(user: UserDto) {
    // Hash the password
    const pass = await this.hashPassword(user.password);

    // Create the user
    const newUser = await this.userService.create({ ...user, password: pass });

    const { password, ...result } = newUser['dataValues'];

    // Generate token
    const token = await this.generateToken(result);

    // Return the user and the token
    return { user: result, token };
  }

  public async login(user: User) {
    const token = await this.generateToken(user);
    return { user, token };
  }

  async validateUser(username: string, pass: string) {
    // Find if user exist with this email
    const user = await this.userService.findOneByEmail(username);
    if (!user) {
      return null;
    }

    // Find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }

    const { password, ...result } = user['dataValues'];
    return result;
  }

  private async comparePassword(
    enteredPassword: string | Buffer,
    dbPassword: string,
  ) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }

  private async generateToken(user: any) {
    const token = await this.jwtService.signAsync(user);
    return token;
  }

  private async hashPassword(password: string | Buffer) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }
}
