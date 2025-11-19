import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MahasiswaDocument = Mahasiswa & Document;

@Schema({ collection: 'Mahasiswa_Bimbingan' })
export class Mahasiswa {
  @Prop({ required: true, unique: true })
  _id: string; // e.g. "s_20250001"

  @Prop({ required: true, unique: true })
  nim: string;

  @Prop({ required: true })
  nama: string;

  @Prop()
  judul_skripsi?: string;

  @Prop({ type: [String], default: [] })
  bidang_minat: string[];

  @Prop({ required: true })
  nip_pembimbing: string; // refer to Dosen.nip

  @Prop({ required: true, enum: ['bimbingan', 'menunggu_pembimbing', 'selesai'] })
  status: string;

  @Prop({ required: true, enum: ['Sistem Informasi', 'Teknik Informatika'] })
  Departemen: string;

  @Prop({ required: true })
  program_studi: string;

  @Prop({ type: [{ 
    t: String,
    kegiatan: String,
    catatan: { type: String, default: '' }
  }], default: [] })
  timeline: { t: string; kegiatan: string; catatan?: string }[];
}

export const MahasiswaSchema = SchemaFactory.createForClass(Mahasiswa);

// useful indexes
MahasiswaSchema.index({ nim: 'hashed' });
MahasiswaSchema.index({ nip_pembimbing: 1 });
MahasiswaSchema.index({ Departemen: 1, program_studi: 1 });
