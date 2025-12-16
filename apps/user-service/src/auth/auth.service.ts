import { Injectable, Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import { RegisterDto, LoginDto, VerifyTokenDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('FIREBASE_APP') private firebaseApp: admin.app.App,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Create user in Firebase Auth
      const userRecord = await this.firebaseApp.auth().createUser({
        email: registerDto.email,
        password: registerDto.password,
        displayName: registerDto.displayName,
      });

      // Set custom claims if needed
      await this.firebaseApp.auth().setCustomUserClaims(userRecord.uid, {
        role: 'user',
      });

      this.logger.log(`User registered successfully: ${userRecord.uid}`);

      // Generate custom token
      const customToken = await this.firebaseApp.auth().createCustomToken(userRecord.uid);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          customToken,
        },
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw new UnauthorizedException(error.message);
    }
  }

  async validateFirebaseToken(idToken: string) {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
      };
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto) {
    const user = await this.validateFirebaseToken(verifyTokenDto.idToken);
    
    // Generate JWT for internal services
    const accessToken = this.jwtService.sign({
      sub: user.uid,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      data: {
        user,
        accessToken,
      },
    };
  }

  async getUserById(uid: string) {
    try {
      const userRecord = await this.firebaseApp.auth().getUser(uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
      };
    } catch (error) {
      this.logger.error(`Get user error: ${error.message}`);
      throw new UnauthorizedException('User not found');
    }
  }

  async deleteUser(uid: string) {
    try {
      await this.firebaseApp.auth().deleteUser(uid);
      this.logger.log(`User deleted successfully: ${uid}`);
      
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Delete user error: ${error.message}`);
      throw new UnauthorizedException(error.message);
    }
  }

  async updateUser(uid: string, updates: any) {
    try {
      const userRecord = await this.firebaseApp.auth().updateUser(uid, updates);
      
      return {
        success: true,
        message: 'User updated successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      };
    } catch (error) {
      this.logger.error(`Update user error: ${error.message}`);
      throw new UnauthorizedException(error.message);
    }
  }
}
