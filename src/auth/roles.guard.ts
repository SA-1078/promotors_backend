import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Obtener roles requeridos desde el decorador @Roles
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        // Si no hay roles requeridos, permitir acceso
        if (!requiredRoles) {
            return true;
        }
        // Obtener el usuario desde el request (previamente inyectado por JwtStrategy)
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            throw new ForbiddenException('User role not found');
        }

        // Verificar si el usuario tiene alguno de los roles requeridos
        const hasRole = requiredRoles.some((role) => user.role.includes(role));
        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return true;
    }
}
