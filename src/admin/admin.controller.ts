import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { AdminLoginDto, CreateAdminDto } from './dto/admin.dto';
import { RefreshJwtGuard } from 'src/guards/refresh.guard';
import { GetAdmin } from 'src/decorator/admin.decorator';

@ApiTags('admin auth')
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get()
  async getUserProfile(@GetAdmin() user: IUserPayload) {
    return await this.admin.findById(user.id);
  }

  @Post('register')
  async registerUser(@Body() dto: CreateAdminDto) {
    return await this.admin.create(dto);
  }

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return await this.admin.login(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    return await this.admin.refreshToken(req.user);
  }
}
