// src/Dosen/dosen.service.ts
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dosen, DosenDocument } from './schemas/Dosen.schema';
import { CreateDosenDto } from './dto/create-dosen.dto';
import { Mahasiswa, MahasiswaDocument } from '../Mahasiswa/schemas/mahasiswa.schema';

@Injectable()
export class DosenService {
  constructor(
    @InjectModel(Dosen.name) private dosenModel: Model<DosenDocument>,
    @InjectModel(Mahasiswa.name) private mahasiswaModel: Model<MahasiswaDocument>,
  ) {}

  async create(createDto: CreateDosenDto) {
    // normalize length safely: treat undefined as 0
    const incomingCount = createDto.id_Mahasiswa_Bimbingan?.length ?? 0;
    if (incomingCount > createDto.kuota_bimbingan) {
      throw new BadRequestException('Jumlah mahasiswa melebihi kuota_bimbingan');
    }

    try {
      const created = await this.dosenModel.create(createDto);
      return created;
    } catch (err: any) {
      if (err?.code === 11000) {
        // duplicate key
        throw new ConflictException('NIP sudah terdaftar');
      }
      throw err;
    }
  }

  async findAll(filter: any = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = this.dosenModel.find(filter).skip(skip).limit(limit);
    const [data, total] = await Promise.all([
      query.lean().exec(),
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

    // safe-length (treat undefined as empty array)
    const ids = dosen.id_Mahasiswa_Bimbingan ?? [];
    if (ids.length === 0) {
      return { dosen, mahasiswa: [], total: 0 };
    }

    const mahasiswa = await this.mahasiswaModel.find({
      _id: { $in: ids },
    }).lean().exec();

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

    // Normalisasi: ambil list atau []
    const ids = dosen.id_Mahasiswa_Bimbingan ?? [];

    // Lepaskan semua mahasiswa bimbingan (optional behaviour)
    if (ids.length > 0) {
      // NOTE: if Mahasiswa.nip_pembimbing is required and disallows null,
      // you may want to set to '' or to some sentinel value instead of null.
      await this.mahasiswaModel.updateMany(
        { _id: { $in: ids } },
        { $set: { nip_pembimbing: null } }
      ).exec();
    }

    // hapus dosen
    await this.dosenModel.deleteOne({ nip }).exec();

    return {
      message: `Dosen ${nip} dihapus & mahasiswa dilepas dari bimbingan`,
      removedBimbingan: ids.length,
    };
  }
}
