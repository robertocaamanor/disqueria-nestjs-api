import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

require('dotenv').config();

@Injectable()
export class UsersServiceService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('Admin credentials not found in env, skipping seed.');
      return;
    }

    const admin = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (!admin) {
      console.log('Seeding admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.userRepository.save({
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
      });
      console.log('Admin user seeded.');
    }
  }

  async create(data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findOne(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
