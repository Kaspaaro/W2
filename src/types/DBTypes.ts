import {Document, Types} from 'mongoose';

type User = Partial<Document> & {
  _id: Types.ObjectId | string;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
};

type UserOutput = Omit<User, 'password' | 'role'>;

type UserInput = Omit<User, '_id' | 'role'>;

type UserTest = Partial<User>;

type LoginUser = Omit<User, 'password'>;

type Cat = Partial<Document> & {
  _id?: Types.ObjectId | string;
  cat_name: string;
  weight: number;
  owner: Types.ObjectId | User;
  filename: string;
  birthdate: Date;
  location: {
    type: string;
    coordinates: [string, string];
  };
};

type CatTest = Partial<Cat>;

export {User, UserOutput, UserInput, UserTest, LoginUser, Cat, CatTest};
