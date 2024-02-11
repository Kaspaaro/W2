import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import CustomError from '../../classes/CustomError';
import {MessageResponse} from '../../types/MessageTypes';
import {userModel} from '../models/userModel';
import bcrypt from 'bcryptjs';
import {User, UserOutput} from '../../types/DBTypes';

// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.user) {
    next(new CustomError('token not valid', 403));
  } else {
    const user = res.locals.user as UserOutput;
    const result = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    res.json(result);
  }
};

// - userGet - get user by id
const userGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      new CustomError(messages, 400);
    }
    const user = await userModel.findById(req.params.id).select('-role');
    if (!user) {
      next(new CustomError('No user found', 404));
      return;
    }
    res.json(user);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - userListGet - get all users
const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-role');
    if (!users) {
      next(new CustomError('No users found', 404));
      return;
    }
    res.json(users);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - userPost - create new user. Remember to hash password
const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      new CustomError(messages, 400);
    }

    const user = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);
    const result = await userModel.create({
      ...user,
      password: hashPassword,
      role: 'user',
    });

    const output: MessageResponse = {
      message: 'Category created',
      data: {user_name: result.user_name, email: result.email},
    };

    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - userPutCurrent - update current user
const userPutCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const user = req.body;

    const result = await userModel
      .findByIdAndUpdate(res.locals.user._id, user, {
        new: true,
      })
      .select('-password -role');

    if (!result) {
      throw new CustomError('No user found', 404);
    }
    const output: MessageResponse = {
      message: 'User updated',
      data: result,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - userDeleteCurrent - delete current user
const userDeleteCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  try {
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => {
          `${error.msg}: ${error.param}`;
        })
        .join(', ');
      throw new CustomError(messages, 400);
    }
    if (!res.locals.user) {
      next(new CustomError('No user found', 404));
      return;
    }
    await userModel.findByIdAndDelete(res.locals.user._id);

    const output: MessageResponse = {
      message: 'User deleted',
      data: {
        _id: res.locals.user._id,
        user_name: res.locals.user.user_name,
        email: res.locals.user.email,
      },
    };
    res.json(output);
  } catch (error) {
    next(error);
  }
};

export {
  checkToken,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
};
