import { IsNotEmpty } from 'class-validator';

export class AccessTokenDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly expiryTimeInMinutes: number;
}
