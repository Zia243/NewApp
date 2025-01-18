import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // Validate user by email and password
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec(); 
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { _id, role, tasks } = user;
    return { id: _id, email, role, tasks };
  }

  // Generate JWT token
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role }; // JWT payload
    return {
      access_token: this.jwtService.sign(payload), // Generate token
    };
  }

  // Verify and decode JWT token
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'defaultSecret', // Use secret for verification
      });
      return decoded; 
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
