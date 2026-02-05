import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

/**
 * Roles decorator
 * Use this to specify which roles can access a route
 * Example: @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
