import { User } from '../users/user.entity';

export interface AuthResponse {
  user: User;
  accessToken: {
    token: string;
    expiryTimeInMinutes: number;
  };
}
