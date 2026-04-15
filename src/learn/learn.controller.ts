import {
  ArgumentMetadata,
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  PipeTransform,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { FeatureFlagsService } from 'src/feature-flags/feature-flags.service';

class UsernameValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      return value;
    }

    const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    if (!usernameRegex.test(value)) {
      throw new BadRequestException('用户名格式不正确');
    }

    return value;
  }
}

class RangeValidationPipe implements PipeTransform {
  constructor(
    private readonly min: number,
    private readonly max: number,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null || value === '') {
      return value;
    }

    const num = parseInt(value);

    if (isNaN(num)) {
      throw new BadRequestException('页码必须是数字');
    }

    if (num < this.min || num > this.max) {
      throw new BadRequestException(
        `页码范围必须在 ${this.min} 到 ${this.max} 之间`,
      );
    }

    return num;
  }
}

@Controller('learn')
export class LearnController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get('pipes/username/:username')
  demoUsernameLow(@Param('username', UsernameValidationPipe) username: string) {
    return {
      step: 'low',
      username,
      note: '已绑定 UsernameValidationPipe',
    };
  }

  @Get('pipes/page')
  @UseInterceptors(LoggingInterceptor)
  queryParams(
    @Query('page', new RangeValidationPipe(1, 100)) page: number | undefined,
  ) {
    return {
      step: 'page',
      page,
      note: '已绑定 RangeValidationPipe',
    };
  }

  @Get('errors/raw')
  demoRawError() {
    throw new Error('非 Http 异常错误');
  }

  @Get('roles/admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminOnly() {
    if (!this.featureFlagsService.isLearnAdminOnlyEnabled()) {
      throw new NotFoundException('Not Found');
    }
    return {
      ok: true,
      message: '你是 admin, 可以访问这个路由',
    };
  }
}
