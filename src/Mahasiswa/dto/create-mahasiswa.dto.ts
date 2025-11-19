import { IsString, IsArray, ArrayNotEmpty, IsOptional, IsIn, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TimelineItemDto {
  @IsString() t: string;
  @IsString() kegiatan: string;
  @IsOptional() @IsString() catatan?: string;
}

export class CreateMahasiswaDto {
  @IsString() _id: string; // s_2025xxxx
  @IsString() nim: string;
  @IsString() nama: string;

  @IsOptional()
  @IsString()
  judul_skripsi?: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  bidang_minat?: string[]; // optional but must be array if present

  @IsString()
  nip_pembimbing: string;

  @IsString()
  @IsIn(['bimbingan', 'menunggu_pembimbing', 'selesai'])
  status: string;

  @IsString()
  @IsIn(['Sistem Informasi', 'Teknik Informatika'])
  Departemen: string;

  @IsString()
  // program_studi will be further validated in service/controller based on Departemen
  program_studi: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineItemDto)
  timeline?: TimelineItemDto[];
}
