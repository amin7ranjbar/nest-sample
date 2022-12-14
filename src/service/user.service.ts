import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangePasswordByIdDto, CreateUserDto } from '../dto';
import { PostgresErrorCode } from '../enum';
import { UserEntity } from '../entity';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { LogoutDto } from 'src/dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    @Inject("REDIS") private redisClient: Redis
  ) { }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      return user;
    }
    throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  public async register(body: CreateUserDto) {
    const hashedPassword = await hash(body.password, 10);
    try {
      const createdUser = await this.create({
        ...body,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async login(body: CreateUserDto) {
    try {
      const user = await this.getByEmail(body.email);
      const isPasswordMatching = await compare(body.password, user.password);
      if (!isPasswordMatching) {
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.createAccessToken(user.id, user.email);
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async changePassword(body: ChangePasswordByIdDto) {
    try {
      const user = await this.getById(body.userId);
      const isPasswordMatching = await compare(body.oldPassword, user.password);
      if (!isPasswordMatching) {
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }
      user.password = await hash(body.newPassword, 10);
      await this.usersRepository.save(user);
      this.logout({ token: body.token })
      return await this.createAccessToken(user.id, user.email);
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async saveAvatar(file, user) {
    const userData = await this.getById(user.id);
    userData.avatar = file.path;
    await this.usersRepository.save(user);
    userData.password = null;
    return userData;
  }

  public async logout(body: LogoutDto) {
    await this.redisClient.del(body.token);
    return {};
  }

  private async createAccessToken(
    id: number,
    email: string,
  ): Promise<{ accessToken: string; }> {
    const AFTER_ONE_DAY = 24 * 60 * 60;
    const accessToken = this.jwtService.sign({ id, email });
    await this.redisClient.set(accessToken, id, "EX", AFTER_ONE_DAY);
    return { accessToken };
  }
}
