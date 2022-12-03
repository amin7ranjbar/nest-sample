import {
  BadRequestException,
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload/',
        filename: function (req, file, cb) {
          cb(null, uuid() + extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 1048576, // 10 Mb
      },
      fileFilter: (req, file, cb) => {
        const whitelist = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
        ];
        if (!whitelist.includes(file.mimetype)) {
          return cb(new BadRequestException('file format is incorrect'), false);
        }
        cb(null, true);
      },
    }),
  )
  saveAvatar(@UploadedFile() file: Express.Multer.File, @User() user) {
    return this.userService.saveAvatar(file, user);
  }
}
