// src/mahasiswa/mahasiswa.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mahasiswa, MahasiswaSchema } from './schemas/mahasiswa.schema';
import { Dosen, DosenSchema } from '../Dosen/schemas/Dosen.schema';
import { MahasiswaService } from './Mahasiswa.service';
import { MahasiswaController } from './Mahasiswa.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mahasiswa.name, schema: MahasiswaSchema }]),
    MongooseModule.forFeature([{ name: Dosen.name, schema: DosenSchema }]),
  ],
  controllers: [MahasiswaController],
  providers: [MahasiswaService],
  exports: [MahasiswaService],
})
export class MahasiswaModule {}
