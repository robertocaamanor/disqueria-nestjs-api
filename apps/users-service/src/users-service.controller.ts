import { Controller } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersServiceService } from './users-service.service';

@Controller()
export class UsersServiceController {
  constructor(private readonly usersService: UsersServiceService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() data: any) {
    return this.usersService.create(data);
  }

  @MessagePattern({ cmd: 'find_user' })
  async findUser(@Payload() email: string) {
    const user = await this.usersService.findOne(email);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @MessagePattern({ cmd: 'validate_user' })
  async validateUser(@Payload() data: any) {
    const user = await this.usersService.findOne(data.email);
    if (user && (await bcrypt.compare(data.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
