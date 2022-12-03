import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto, CreateUserDto } from '../dto';
import { UserService } from '../service';
import { User } from '../decorator';
import { JwtGuard } from '../guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config';

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

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  saveAvatar(@UploadedFile() file: Express.Multer.File, @User() user) {
    return this.userService.saveAvatar(file, user);
  }
}
