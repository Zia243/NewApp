import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    const state = this.connection.readyState;
    switch (state) {
      case 0:
        console.error('Database is disconnected');
        break;
      case 1:
        console.log('Database is connected');
        break;
      case 2:
        console.log('Database is connecting...');
        break;
      case 3:
        console.log('Database is disconnecting...');
        break;
      default:
        console.error('Database connection state is unknown');
    }
  }
}
