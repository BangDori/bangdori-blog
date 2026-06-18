import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateExternalPostDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  source?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;
}
