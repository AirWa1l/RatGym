import { Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';

export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private users: Map<string, User> = new Map();

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    let user = this.users.get(username);
    
    if (!user) {
      // Crear nuevo usuario automáticamente
      user = {
        id: `user_${Date.now()}`,
        username,
        createdAt: new Date(),
      };
      this.users.set(username, user);
      this.logger.log(`New user created: ${username}`);
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        user,
        token: `local_${user.id}`,
      },
    };
  }

  async getUserByUsername(username: string) {
    const user = this.users.get(username);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  getAllUsers() {
    return {
      success: true,
      data: Array.from(this.users.values()),
    };
  }
}
