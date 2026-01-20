
import { Controller, Post, Body, Inject, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiBody, ApiProperty } from '@nestjs/swagger';

class LoginDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    // 1. Verify credentials with Users Service
    const user = await lastValueFrom(this.usersClient.send({ cmd: 'validate_user' }, loginDto));
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Generate Token
    return this.authService.login(user);
  }
}
