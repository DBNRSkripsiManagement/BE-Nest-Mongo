// src/mahasiswa/dto/create-mahasiswa.dto.ts
import { IsString, IsArray, IsOptional, IsIn, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TimelineItemDto {
  @IsString()
  t: string;

  @IsString()
  kegiatan: string;

  @IsOptional()
  @IsString()
  catatan?: string;
}

export class CreateMahasiswaDto {
  @IsString()
  _id: string;

  @IsString()
  nim: string;

  @IsString()
  nama: string;

  @IsOptional()
  @IsString()
  judul_skripsi?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  bidang_minat?: string[];

  @IsString()
  nip_pembimbing: string;

  @IsString()
  @IsIn(['bimbingan', 'menunggu_pembimbing', 'selesai'])
  status: string;

  @IsString()
  @IsIn(['Sistem Informasi', 'Teknik Informatika'])
  Departemen: string;

  @IsString()
  program_studi: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineItemDto)
  timeline?: TimelineItemDto[];
}
