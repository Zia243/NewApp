import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = await this.authService.verifyToken(token);
      req.user = decoded; // Attach the user payload to the request
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
