import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

export function validateImage(allowedExtensions: string[]): PipeTransform {
  return new ParseFilePipeDocument(allowedExtensions);
}

@Injectable()
export class ParseFilePipeDocument implements PipeTransform {
  constructor(private readonly allowedExtensions: string[]) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Image field must not be empty');
    }

    if (!file.mimetype.startsWith('image')) {
      throw new BadRequestException(
        'Sorry, this file is not an image. Please try again',
      );
    }

    const extension = extname(file.originalname);
    if (!this.allowedExtensions.includes(extension)) {
      throw new BadRequestException(`File type ${extension} not supported`);
    }

    if (file.size > 3000000) {
      throw new BadRequestException(
        'Please upload an image size not more than 3MB',
      );
    }

    return file;
  }
}
