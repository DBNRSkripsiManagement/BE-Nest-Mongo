// src/mahasiswa/mahasiswa.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Mahasiswa, MahasiswaDocument } from './schemas/mahasiswa.schema';
import { Dosen, DosenDocument } from '../Dosen/schemas/Dosen.schema';
import { CreateMahasiswaDto } from './dto/create-mahasiswa.dto';
import { UpdateMahasiswaDto } from './dto/update-mahasiswa.dto';

@Injectable()
export class MahasiswaService {
  constructor(
    @InjectModel(Mahasiswa.name) private mahasiswaModel: Model<MahasiswaDocument>,
    @InjectModel(Dosen.name) private dosenModel: Model<DosenDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // mapping program studi validator
  private validateProgramStudi(dept: string, program: string) {
    const map: Record<string, string[]> = {
      'Sistem Informasi': ['Teknologi Informasi', 'Sistem Informasi', 'Pendidikan Teknologi Informasi'],
      'Teknik Informatika': ['Teknik Komputer', 'Teknik Informatika'],
    };
    if (!map[dept]) throw new BadRequestException(`Departemen tidak dikenal: ${dept}`);
    if (!map[dept].includes(program)) {
      throw new BadRequestException(`Program studi "${program}" tidak valid untuk departemen "${dept}"`);
    }
  }

  // detect if transactions are supported on this connection
  private supportsTransactions(): boolean {
    try {
      // heuristik: replica set name exists in topology options or rs status works
      const client: any = (this.connection as any).client;
      const topology = client?.topology;
      const hasReplSet = !!(topology && topology.s && topology.s.options && topology.s.options.replicaSet);
      // fallback to environment variable if you want to force
      if (process.env.FORCE_TX === 'true') return true;
      return hasReplSet;
    } catch {
      return false;
    }
  }

  /** TRANSACTIONAL implementation (Atlas / replica set required) */
  private async createWithTransactionInner(createDto: CreateMahasiswaDto) {
    // validate program studi first
    this.validateProgramStudi(createDto.Departemen, createDto.program_studi);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const dosen = await this.dosenModel.findOne({ nip: createDto.nip_pembimbing }).session(session).exec();
      if (!dosen) throw new NotFoundException(`Pembimbing ${createDto.nip_pembimbing} tidak ditemukan`);

      if (dosen.sedang_membimbing >= dosen.kuota_bimbingan) {
        throw new BadRequestException('Pembimbing sudah penuh, pilih pembimbing lain');
      }

      const createdArr = await this.mahasiswaModel.create([createDto], { session });
      const created = createdArr[0];

      await this.dosenModel.updateOne(
        { nip: createDto.nip_pembimbing },
        { $push: { id_Mahasiswa_Bimbingan: createDto._id }, $inc: { sedang_membimbing: 1 } },
        { session },
      ).exec();

      await session.commitTransaction();
      return created;
    } catch (err) {
      await session.abortTransaction();
      if ((err as any)?.code === 11000) throw new ConflictException('Duplicate key: _id atau nim sudah terdaftar');
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err.message || 'Gagal membuat mahasiswa (transaction)');
    } finally {
      session.endSession();
    }
  }

  /** FALLBACK implementation (single-node) using atomic update on dosen doc + rollback */
  private async createWithConditionalUpdate(createDto: CreateMahasiswaDto) {
    // validate program studi first
    this.validateProgramStudi(createDto.Departemen, createDto.program_studi);

    // Attempt to increment 'sedang_membimbing' atomically only if masih dibawah kuota.
    const filter: any = {
      nip: createDto.nip_pembimbing,
      $expr: { $lt: ['$sedang_membimbing', '$kuota_bimbingan'] },
    };

    const update: any = { $inc: { sedang_membimbing: 1 }, $push: { id_Mahasiswa_Bimbingan: createDto._id } };

    // findOneAndUpdate with condition ensures atomic reservation of slot on dosen document
    const updatedDosen = await this.dosenModel.findOneAndUpdate(filter, update, { new: true }).exec();

    if (!updatedDosen) {
      // either dosen tidak ditemukan or sudah penuh
      // check exist:
      const exist = await this.dosenModel.findOne({ nip: createDto.nip_pembimbing }).exec();
      if (!exist) throw new NotFoundException(`Pembimbing ${createDto.nip_pembimbing} tidak ditemukan`);
      throw new BadRequestException('Pembimbing sudah penuh, pilih pembimbing lain');
    }

    // now we reserved the slot — try to create mahasiswa
    try {
      const created = await this.mahasiswaModel.create(createDto);
      return created;
    } catch (err) {
      // if insert fails (duplicate key etc) — rollback dosen reservation
      await this.dosenModel.updateOne(
        { nip: createDto.nip_pembimbing },
        { $inc: { sedang_membimbing: -1 }, $pull: { id_Mahasiswa_Bimbingan: createDto._id } },
      ).exec();

      if ((err as any)?.code === 11000) {
        throw new ConflictException('Duplicate key: _id atau nim sudah terdaftar');
      }
      throw new InternalServerErrorException(err.message || 'Gagal membuat mahasiswa (fallback)');
    }
  }

  /** Public create method: choose transactional if supported, else fallback */
  async create(createDto: CreateMahasiswaDto) {
    if (this.supportsTransactions()) {
      return this.createWithTransactionInner(createDto);
    }
    return this.createWithConditionalUpdate(createDto);
  }

  // rest of service methods (findAll, findById, update, remove) - keep as before
  async findAll(filter: any = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.mahasiswaModel.find(filter).skip(skip).limit(limit).lean().exec(),
      this.mahasiswaModel.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const doc = await this.mahasiswaModel.findOne({ _id: id }).exec();
    if (!doc) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return doc;
  }

  async findByNim(nim: string) {
    const doc = await this.mahasiswaModel.findOne({ nim }).exec();
    if (!doc) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return doc;
  }

  async update(id: string, updateDto: UpdateMahasiswaDto) {
    // validate changes
    if (updateDto.Departemen && updateDto.program_studi) {
      this.validateProgramStudi(updateDto.Departemen, updateDto.program_studi);
    } else if (updateDto.program_studi) {
      const curr = await this.findById(id);
      this.validateProgramStudi(curr.Departemen, updateDto.program_studi);
    } else if (updateDto.Departemen && !updateDto.program_studi) {
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
