export const SEQUELIZE = 'SEQUELIZE';
export const DEVELOPMENT = 'development';
export const TEST = 'test';
export const PRODUCTION = 'production';
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const POST_REPOSITORY = 'POST_REPOSITORY';
export const COMMENT_REPOSITORY = 'COMMENT_REPOSITORY';
export const CLOUDINARY = 'CLOUDINARY';
export const DEFAULT_SUCCESS_MESSAGE = 'Request processed successfully';
export const INVALID_TOKEN_MESSAGE = 'Invalid token';
export const BAD_TOKEN_FORMAT_MESSAGE = 'Bad Token Format';
export const INVALID_USER_CREDENTIALS_MESSAGE = 'Invalid user credentials';
export const USER_NOT_FOUND_MESSAGE = 'No user found';
export const POST_NOT_FOUND_MESSAGE = 'No post found';
export enum ORDER_BY {
  DESC = 'DESC',
  ASC = 'ASC',
}
export const validImageMimeTypes = ['.png', '.jpg', '.jpeg'];
export const validMultiImagesMimeTypes = ['.gif', ...validImageMimeTypes];
