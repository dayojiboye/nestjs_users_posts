import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../users/dto/user.dto';
import {
  DEFAULT_SUCCESS_MESSAGE,
  INVALID_USER_CREDENTIALS_MESSAGE,
} from 'src/core/constants';
import { AuthResponseDto } from './dto/authResponse.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(
    user: UserDto,
  ): Promise<{ message: string; data: AuthResponseDto }> {
    // Hash the password
    const hashedPassword = await this.hashPassword(user.password);

    // To-Do: Integrate registration with profile picture
    // Create the user
    const newUser = await this.userService.create({
      ...user,
      password: hashedPassword,
    });

    const result = newUser.dataValues;
    delete result.password;

    // Generate token
    const accessToken = await this.generateToken(result);

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: {
        user: result,
        accessToken: {
          token: accessToken,
          expiryTimeInMinutes: Number(process.env.TOKEN_EXPIRATION),
        },
      },
    };
  }

  public async login(
    email: string,
    pass: string,
  ): Promise<{ message: string; data: AuthResponseDto }> {
    // Find if user exists in DB
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException(INVALID_USER_CREDENTIALS_MESSAGE);
    }

    // Find if user password match
    const match = await this.comparePassword(pass, user.password);

    if (!match) {
      throw new UnauthorizedException(INVALID_USER_CREDENTIALS_MESSAGE);
    }

    const result = user.dataValues;
    delete result.password;

    const accessToken = await this.generateToken(result);

    return {
      message: DEFAULT_SUCCESS_MESSAGE,
      data: {
        user: result,
        accessToken: {
          token: accessToken,
          expiryTimeInMinutes: Number(process.env.TOKEN_EXPIRATION),
        },
      },
    };
  }

  public async comparePassword(
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

  public async hashPassword(password: string | Buffer) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }
}
