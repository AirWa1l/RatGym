import { Controller, Post, Body, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyTokenDto } from './dto/auth.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Register request for: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('verify')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto);
  }

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@Request() req) {
    return {
      success: true,
      data: req.user,
    };
  }

  // Microservice patterns for Saga orchestration
  @MessagePattern('user.register')
  async handleRegisterEvent(@Payload() data: RegisterDto) {
    this.logger.log(`Received register event for: ${data.email}`);
    return this.authService.register(data);
  }

  @MessagePattern('user.verify')
  async handleVerifyEvent(@Payload() data: VerifyTokenDto) {
    return this.authService.verifyToken(data);
  }

  @MessagePattern('user.getById')
  async handleGetUserEvent(@Payload() data: { uid: string }) {
    return this.authService.getUserById(data.uid);
  }

  @MessagePattern('user.delete')
  async handleDeleteUserEvent(@Payload() data: { uid: string }) {
    return this.authService.deleteUser(data.uid);
  }

  @MessagePattern('user.update')
  async handleUpdateUserEvent(@Payload() data: { uid: string; updates: any }) {
    return this.authService.updateUser(data.uid, data.updates);
  }
}
