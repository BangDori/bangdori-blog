import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminPostDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  content_mdx!: string;

  @IsString()
  @IsNotEmpty()
  author!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  thumbnail_url?: string | null;

  @IsOptional()
  @IsISO8601()
  published_at?: string | null;
}
