// dosen/dosen.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dosen, DosenDocument } from './schemas/Dosen.schema';
import { CreateDosenDto } from './dto/create-dosen.dto';

@Injectable()
export class DosenService {
  constructor(@InjectModel(Dosen.name) private dosenModel: Model<DosenDocument>) {}

  async create(createDto: CreateDosenDto) {
    // enforce array length <= kuota (redundant if validator already)
    if (createDto.id_Mahasiswa_Bimbingan?.length > createDto.kuota_bimbingan) {
      throw new BadRequestException('Jumlah mahasiswa melebihi kuota_bimbingan');
    }
    return this.dosenModel.create(createDto);
  }

  // get all with pagination & filter
  async findAll(filter: any = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = this.dosenModel.find(filter).skip(skip).limit(limit);
    const [data, total] = await Promise.all([query.exec(), this.dosenModel.countDocuments(filter)]);
    return { data, total, page, limit };
  }

  async findByNip(nip: string) {
    return this.dosenModel.findOne({ nip }).exec();
  }

  // contoh: Cari dosen berdasarkan departemen
  async findByDepartemen(dept: string, page = 1, limit = 20) {
    return this.findAll({ Departemen: dept }, page, limit);
  }
}
