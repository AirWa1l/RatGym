import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login request for: ${loginDto.username}`);
    return this.authService.login(loginDto);
  }

  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  // Microservice patterns for Saga orchestration
  @MessagePattern('user.login')
  async handleLoginEvent(@Payload() data: LoginDto) {
    this.logger.log(`Received login event for: ${data.username}`);
    return this.authService.login(data);
  }

  @MessagePattern('user.getByUsername')
  async handleGetUserEvent(@Payload() data: { username: string }) {
    return this.authService.getUserByUsername(data.username);
  }
}
