import { DynamicModule, Module } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { FEATURE_FLAGS } from './feature-flags.constants';
import { ConfigService } from '@nestjs/config';
import { FeatureFlags } from './feature-flags.types';

@Module({})
export class FeatureFlagsModule {
  static forRootAsync(): DynamicModule {
    return {
      module: FeatureFlagsModule,
      providers: [
        {
          provide: FEATURE_FLAGS,
          inject: [ConfigService],
          useFactory: (configService: ConfigService): FeatureFlags => ({
            enableLearnAdminOnly:
              configService.get('ENABLE_LEARN_ADMIN_ONLY', 'true') === 'true',
          }),
        },
        FeatureFlagsService,
      ],
      exports: [FeatureFlagsService],
    };
  }
}
