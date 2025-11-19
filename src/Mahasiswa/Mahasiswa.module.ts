import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mahasiswa, MahasiswaSchema } from './schemas/mahasiswa.schema';
import { MahasiswaService } from './Mahasiswa.service';
import { MahasiswaController } from './Mahasiswa.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Mahasiswa.name, schema: MahasiswaSchema }])],
  controllers: [MahasiswaController],
  providers: [MahasiswaService],
  exports: [MahasiswaService],
})
export class MahasiswaModule {}
