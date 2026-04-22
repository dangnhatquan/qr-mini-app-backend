import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';


import { AuthZaloController } from './auth-zalo.controller';
import { AuthZaloService } from './auth-zalo.service';
import { UsersModule } from '../users/users.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    UsersModule,
    SessionModule,
    JwtModule.register({}),
  ],
  controllers: [AuthZaloController],
  providers: [AuthZaloService],
  exports: [AuthZaloService],
})
export class AuthZaloModule {}