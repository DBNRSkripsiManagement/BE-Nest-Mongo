// dosen/dosen.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dosen, DosenSchema } from './schemas/Dosen.schema';
import { DosenService } from './Dosen.service';
import { DosenController } from './Dosen.controller';
import { Mahasiswa, MahasiswaSchema } from '../Mahasiswa/schemas/mahasiswa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dosen.name, schema: DosenSchema }]),
    MongooseModule.forFeature([{ name: Mahasiswa.name, schema: MahasiswaSchema }]),
  ],
  providers: [DosenService],
  controllers: [DosenController],
  exports: [DosenService],
})
export class DosenModule {}
