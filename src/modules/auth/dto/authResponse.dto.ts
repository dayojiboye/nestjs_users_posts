import { User } from 'src/modules/users/user.entity';
import { AccessTokenDto } from './accessToken.dto';
import { IsNotEmpty, IsObject } from 'class-validator';

export class AuthResponseDto {
  @IsObject()
  @IsNotEmpty()
  readonly user: User;

  @IsObject()
  @IsNotEmpty()
  readonly accessToken: AccessTokenDto;
}
