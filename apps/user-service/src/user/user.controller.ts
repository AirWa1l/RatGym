import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.uid);
  }

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
  async updateProfile(@Request() req, @Body() data: any) {
    return this.userService.updateUserProfile(req.user.uid, data);
  }

  @MessagePattern('user.profile.get')
  async handleGetProfileEvent(@Payload() data: { uid: string }) {
    return this.userService.getUserProfile(data.uid);
  }

  @MessagePattern('user.profile.update')
  async handleUpdateProfileEvent(@Payload() data: { uid: string; updates: any }) {
    return this.userService.updateUserProfile(data.uid, data.updates);
  }
}
