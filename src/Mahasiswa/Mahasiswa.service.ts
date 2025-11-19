import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mahasiswa, MahasiswaDocument } from './schemas/mahasiswa.schema';
import { CreateMahasiswaDto } from './dto/create-mahasiswa.dto';
import { UpdateMahasiswaDto } from './dto/update-mahasiswa.dto';

@Injectable()
export class MahasiswaService {
  constructor(@InjectModel(Mahasiswa.name) private mahasiswaModel: Model<MahasiswaDocument>) {}

  // validate program_studi consistent with Departemen
  private validateProgramStudi(dept: string, program: string) {
    const map = {
      'Sistem Informasi': ['Teknologi Informasi', 'Sistem Informasi', 'Pendidikan Teknologi Informasi'],
      'Teknik Informatika': ['Teknik Komputer', 'Teknik Informatika'],
    } as Record<string, string[]>;

    if (!map[dept]) throw new BadRequestException(`Departemen tidak dikenal: ${dept}`);
    if (!map[dept].includes(program)) {
      throw new BadRequestException(`Program studi "${program}" tidak valid untuk departemen "${dept}"`);
    }
  }

  async create(createDto: CreateMahasiswaDto) {
    // validate program_studi vs Departemen
    this.validateProgramStudi(createDto.Departemen, createDto.program_studi);

    // ensure unique nim/_id handled by DB (catch duplicate error)
    try {
      const doc = await this.mahasiswaModel.create(createDto);
      return doc;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException('NIM / _id sudah terdaftar');
      }
      throw err;
    }
  }

  async findAll(filter: any = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.mahasiswaModel.find(filter).skip(skip).limit(limit).lean().exec(),
      this.mahasiswaModel.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findByNim(nim: string) {
    const doc = await this.mahasiswaModel.findOne({ nim }).exec();
    if (!doc) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return doc;
  }

  async findById(id: string) {
    const doc = await this.mahasiswaModel.findOne({ _id: id }).exec();
    if (!doc) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return doc;
  }

  async findByPembimbing(nip: string, page = 1, limit = 20) {
    return this.findAll({ nip_pembimbing: nip }, page, limit);
  }

  async update(id: string, updateDto: UpdateMahasiswaDto) {
    if (updateDto.Departemen && updateDto.program_studi) {
      this.validateProgramStudi(updateDto.Departemen, updateDto.program_studi);
    } else if (updateDto.program_studi) {
      // need to fetch current Departemen to validate
      const curr = await this.findById(id);
      this.validateProgramStudi(curr.Departemen, updateDto.program_studi);
    } else if (updateDto.Departemen && !updateDto.program_studi) {
      // if Departemen changes, ensure existing program_studi still valid
      const curr = await this.findById(id);
      this.validateProgramStudi(updateDto.Departemen, curr.program_studi);
    }

    const updated = await this.mahasiswaModel.findOneAndUpdate({ _id: id }, { $set: updateDto }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Mahasiswa tidak ditemukan untuk update');
    return updated;
  }

  async remove(id: string) {
    const res = await this.mahasiswaModel.deleteOne({ _id: id }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Mahasiswa tidak ditemukan untuk dihapus');
    return { ok: true };
  }
}
