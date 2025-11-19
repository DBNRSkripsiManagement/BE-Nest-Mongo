// dosen/schemas/dosen.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DosenDocument = Dosen & Document;

@Schema({ collection: 'Dosen_Pembimbing' })
export class Dosen {
  @Prop({ required: true, unique: true })
  nip: string;

  @Prop({ required: true })
  nama: string;

  @Prop({ type: [String], required: true, validate: [(val: string[]) => val.length === 3, 'bidang_keahlian must have 3 items'] })
  bidang_keahlian: string[];

  @Prop({ required: true, type: Number, min: 0 })
  kuota_bimbingan: number;

  @Prop({ required: true, type: Number, min: 0 })
  sedang_membimbing: number;

  @Prop({ required: true, enum: ['Sistem Informasi', 'Teknik Informatika'] })
  Departemen: string;

  @Prop({ type: [String], default: [] })
  id_Mahasiswa_Bimbingan: string[];
}

export const DosenSchema = SchemaFactory.createForClass(Dosen);

DosenSchema.index({ nip: 'hashed' });
DosenSchema.index({ Departemen: 1 });
