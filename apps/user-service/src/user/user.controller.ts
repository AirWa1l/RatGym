import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile() {
    return { message: 'Profile endpoint - authentication simplified' };
  }

  @MessagePattern('user.profile.get')
  async handleGetProfileEvent(@Payload() data: { username: string }) {
    return this.userService.getUserProfile(data.username);
  }
}
