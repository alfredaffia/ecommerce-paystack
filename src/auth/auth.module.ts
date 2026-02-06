import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
      PassportModule.register({ 
      defaultStrategy: 'jwt', 
      session:true 
    }),
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    // Use a fallback empty string or throw error if missing
    secret: config.get<string>('JWT_SECRET') || 'fallbackSecret', 
    signOptions: {
      // Cast the value or provide a default string like '1d'
      expiresIn: config.get<string>('JWT_EXPIRES_IN') as any || '3600s',
    },
  }),
}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
