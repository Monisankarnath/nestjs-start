import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating a new user: ${JSON.stringify(createUserDto)}`);
    return this.usersService.create(createUserDto);
  }
}
