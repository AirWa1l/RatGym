import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: (configService: ConfigService) => {
        const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
        const privateKey = configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
        const clientEmail = configService.get<string>('FIREBASE_CLIENT_EMAIL');

        if (!admin.apps.length) {
          return admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey,
              clientEmail,
            }),
          });
        }
        return admin.app();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_APP'],
})
export class FirebaseModule {}
