import { IsISO8601, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateExternalPostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsUrl({ require_protocol: true })
  url!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string | null;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}
