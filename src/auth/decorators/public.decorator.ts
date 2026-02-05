import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator
 * Use this to mark routes that don't require authentication
 * Example: @Public()
 */
export const Public = () => SetMetadata('isPublic', true);
