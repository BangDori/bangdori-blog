import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UploadsError } from '@admin/uploads/uploads.error';
import {
  type AllowedUploadContentType,
  ALLOWED_UPLOAD_CONTENT_TYPES,
} from '@admin/uploads/uploads-policy';

const FILENAME_EXTENSION_PATTERN = /\.(png|jpe?g|webp|gif)$/i;

export class PresignUploadDto {
  @IsIn([...ALLOWED_UPLOAD_CONTENT_TYPES], { message: UploadsError.invalidContentType })
  contentType!: AllowedUploadContentType;

  @IsString({ message: UploadsError.invalidFilename })
  @MinLength(1, { message: UploadsError.invalidFilename })
  @MaxLength(200, { message: UploadsError.filenameTooLong })
  @Matches(FILENAME_EXTENSION_PATTERN, { message: UploadsError.invalidExtension })
  originalFilename!: string;
}
