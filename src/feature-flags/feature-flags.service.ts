import { Inject, Injectable } from '@nestjs/common';
import { FEATURE_FLAGS } from './feature-flags.constants';
import type { FeatureFlags } from './feature-flags.types';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @Inject(FEATURE_FLAGS)
    private readonly flags: FeatureFlags,
  ) {}

  isLearnAdminOnlyEnabled(): boolean {
    return this.flags.enableLearnAdminOnly;
  }
}
