import {
  BadRequestException,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { extname } from 'path';

export function validateImage(allowedExtensions: string[]): PipeTransform {
  return new ParseFilePipeDocument(allowedExtensions);
}

@Injectable()
export class ParseFilePipeDocument implements PipeTransform {
  constructor(private readonly allowedExtensions: string[]) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new UnprocessableEntityException({
        message: 'Image field must not be empty',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    if (!file.mimetype.startsWith('image')) {
      throw new UnprocessableEntityException({
        message: 'Sorry, this file is not an image. Please try again',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    const extension = extname(file.originalname);
    if (!this.allowedExtensions.includes(extension)) {
      throw new BadRequestException(`File type ${extension} not supported`);
    }

    if (file.size > 3000000) {
      throw new UnprocessableEntityException({
        message: 'Please upload an image size not more than 3MB',
        error: 'Unprocessable Entity',
        statusCode: 422,
      });
    }

    return file;
  }
}
