// dosen/dto/create-dosen.dto.ts
import { IsString, IsArray, ArrayMinSize, ArrayMaxSize, IsInt, Min, IsIn } from 'class-validator';

export class CreateDosenDto {
  @IsString() nip: string;
  @IsString() nama: string;
  @IsArray() @ArrayMinSize(3) @ArrayMaxSize(3) bidang_keahlian: string[];
  @IsInt() @Min(0) kuota_bimbingan: number;
  @IsInt() @Min(0) sedang_membimbing: number;
  @IsString() @IsIn(['Sistem Informasi','Teknik Informatika']) Departemen: string;
  @IsArray() id_Mahasiswa_Bimbingan?: string[];
}
