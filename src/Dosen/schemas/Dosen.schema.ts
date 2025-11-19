// src/Dosen/schemas/dosen.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DosenDocument = Dosen & Document;

@Schema({ collection: 'Dosen_Pembimbing' })
export class Dosen {
  @Prop({ required: true, unique: true })
  nip: string;

  @Prop({ required: true })
  nama: string;

  @Prop({ type: [String], required: true, default: [] })
  bidang_keahlian: string[];

  @Prop({ type: Number, required: true, default: 0 })
  kuota_bimbingan: number;

  @Prop({ type: Number, required: true, default: 0 })
  sedang_membimbing: number;

  @Prop({ type: [String], default: [] })
  id_Mahasiswa_Bimbingan: string[];

  @Prop({ required: true, enum: ['Sistem Informasi', 'Teknik Informatika'] })
  Departemen: string;
}

export const DosenSchema = SchemaFactory.createForClass(Dosen);

// useful indexes
DosenSchema.index({ nip: 'hashed' });
DosenSchema.index({ Departemen: 1 });
