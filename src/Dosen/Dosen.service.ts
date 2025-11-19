import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dosen, DosenDocument } from './schemas/Dosen.schema';
import { CreateDosenDto } from './dto/create-dosen.dto';
import { Mahasiswa, MahasiswaDocument } from '../mahasiswa/schemas/Mahasiswa.schema';

@Injectable()
export class DosenService {
  constructor(
    @InjectModel(Dosen.name) private dosenModel: Model<DosenDocument>,
    @InjectModel(Mahasiswa.name) private mahasiswaModel: Model<MahasiswaDocument>,
  ) {}

  async create(createDto: CreateDosenDto) {
    if (createDto.id_Mahasiswa_Bimbingan?.length > createDto.kuota_bimbingan) {
      throw new BadRequestException('Jumlah mahasiswa melebihi kuota_bimbingan');
    }
    return this.dosenModel.create(createDto);
  }

  async findAll(filter: any = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = this.dosenModel.find(filter).skip(skip).limit(limit);
    const [data, total] = await Promise.all([
      query.exec(),
      this.dosenModel.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findByNip(nip: string) {
    const dosen = await this.dosenModel.findOne({ nip }).exec();
    if (!dosen) throw new NotFoundException('Dosen tidak ditemukan');
    return dosen;
  }

  /** -----------------------------
   * getBimbingan
   * Mengambil daftar mahasiswa yang dibimbing dosen ini
   * ----------------------------- */
  async getBimbingan(nip: string) {
    const dosen = await this.findByNip(nip);

    // jika belum punya mahasiswa
    if (!dosen.id_Mahasiswa_Bimbingan || dosen.id_Mahasiswa_Bimbingan.length === 0) {
      return { dosen, mahasiswa: [] };
    }

    const mahasiswa = await this.mahasiswaModel.find({
      _id: { $in: dosen.id_Mahasiswa_Bimbingan },
    });

    return {
      dosen,
      total: mahasiswa.length,
      mahasiswa,
    };
  }

  async deleteDosen(nip: string) {
  const dosen = await this.dosenModel.findOne({ nip }).exec();
  if (!dosen) {
    throw new NotFoundException('Dosen tidak ditemukan');
  }

  // lepaskan semua mahasiswa bimbingan (optional behaviour)
  if (dosen.id_Mahasiswa_Bimbingan?.length > 0) {
    await this.mahasiswaModel.updateMany(
      { _id: { $in: dosen.id_Mahasiswa_Bimbingan } },
      { $set: { nip_pembimbing: null } }
    );
  }

  // hapus dosen
  await this.dosenModel.deleteOne({ nip });

  return {
    message: `Dosen ${nip} dihapus & mahasiswa dilepas dari bimbingan`,
    removedBimbingan: dosen.id_Mahasiswa_Bimbingan.length,
  };
}

}
