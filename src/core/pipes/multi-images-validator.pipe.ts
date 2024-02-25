import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

export function validateMultiImages(
  allowedExtensions: string[],
): PipeTransform {
  return new ParseFilePipeDocument(allowedExtensions);
}

@Injectable()
export class ParseFilePipeDocument implements PipeTransform {
  constructor(private readonly allowedExtensions: string[]) {}

  transform(files: Array<Express.Multer.File>): Array<Express.Multer.File> {
    if (!files) {
      return;
    }

    if (files.some((file) => !file.mimetype.startsWith('image'))) {
      throw new BadRequestException(
        'File is not an actual image. Please try again',
      );
    }

    const extensions = files.map((file) => extname(file.originalname));

    const isExtensionValid = extensions.some((ext) =>
      this.allowedExtensions.includes(ext),
    );

    if (!isExtensionValid) {
      throw new BadRequestException(
        `Only file types ${this.allowedExtensions} are supported`,
      );
    }

    if (files.some((file) => file.size > 3000000)) {
      throw new BadRequestException(
        'Please upload an image size not more than 3MB',
      );
    }

    return files;
  }
}
