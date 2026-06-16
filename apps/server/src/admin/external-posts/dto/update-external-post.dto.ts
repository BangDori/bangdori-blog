import { IsISO8601, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

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
  category?: string | null;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string | null;
}
