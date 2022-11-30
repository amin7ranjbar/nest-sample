import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto, CreateUserDto } from '../dto';
import { UserService } from '../service';
import { User } from '../decorator';
import { JwtGuard } from '../guard';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.userService.register(body);
  }

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    return this.userService.login(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(@User() user, @Body() body: ChangePasswordDto) {
    return this.userService.changePassword({ userId: user.id, ...body });
  }
}
