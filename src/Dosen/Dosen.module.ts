// dosen/dosen.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dosen, DosenSchema } from './schemas/Dosen.schema';
import { DosenService } from './Dosen.service';
import { DosenController } from './Dosen.controller';

// Tambahkan:
import { Mahasiswa, MahasiswaSchema } from '../mahasiswa/schemas/Mahasiswa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dosen.name, schema: DosenSchema }]),
    MongooseModule.forFeature([{ name: Mahasiswa.name, schema: MahasiswaSchema }]), // <─ NEW
  ],
  providers: [DosenService],
  controllers: [DosenController],
  exports: [DosenService],
})
export class DosenModule {}
