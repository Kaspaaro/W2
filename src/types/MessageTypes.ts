import {Cat, UserOutput} from './DBTypes';

type MessageResponse = {
  message: string;
  data: {};
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type LoginResponse = {
  token: string;
  user: UserOutput;
};

type UploadResponse = MessageResponse & {
  id: number;
};

export {MessageResponse, ErrorResponse, LoginResponse, UploadResponse};
