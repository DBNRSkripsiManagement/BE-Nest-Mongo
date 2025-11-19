// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConnectOptions } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DosenModule } from './Dosen/Dosen.module';
import { MahasiswaModule } from './Mahasiswa/Mahasiswa.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment');
        }
        const options: ConnectOptions = {
          dbName: configService.get<string>('MONGODB_DB', 'DBNR'),
          family: 4,
          serverSelectionTimeoutMS: 5000,
        };
        return { uri, ...options } as any;
      },
      inject: [ConfigService],
    }),
    DosenModule,
    MahasiswaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
