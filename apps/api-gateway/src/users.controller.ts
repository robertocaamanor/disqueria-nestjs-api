import { Controller, Get, Post, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from '@app/shared';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user (Register)' })
  createUser(@Body() data: CreateUserDto) {
    return this.client.send({ cmd: 'create_user' }, data);
  }

  @Get(':email')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find user by email (Protected)' })
  findUser(@Param('email') email: string) {
    return this.client.send({ cmd: 'find_user' }, email);
  }
}
