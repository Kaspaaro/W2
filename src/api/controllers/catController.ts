import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import catModel from '../models/catModel';
import {validationResult} from 'express-validator';
import CustomError from '../../classes/CustomError';
import rectangleBounds from '../../utils/rectangleBounds';
import {User, Cat} from '../../types/DBTypes';
import {userModel} from '../models/userModel';

// TODO: create following functions:
// - catGetByUser - get all cats by current user id
const catGetByUser = async (
  req: Request<{}, {}, Cat>,
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
      throw new CustomError(messages, 400);
    }
    const cat = await catModel
      .find({owner: res.locals.user._id})
      .populate('owner');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
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
      throw new CustomError(messages, 400);
    }

    const {topRight, bottomLeft} = req.query;
    const [trLat, trLng] = topRight.split(',');
    const [blLat, blLng] = bottomLeft.split(',');
    const bounds = rectangleBounds(
      {lng: parseFloat(trLat), lat: parseFloat(trLng)},
      {lat: parseFloat(blLat), lng: parseFloat(blLng)}
    );
    const cats = await catModel.find({
      location: {
        $geoWithin: {
          $geometry: bounds,
        },
      },
    });
    if (!cats) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catPutAdmin - only admin can change cat owner
const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
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
      throw new CustomError(messages, 400);
    }
    if (res.locals.user.role === 'admin') {
      const cat = await catModel
        .findByIdAndUpdate(req.params.id, req.body, {new: true})
        .populate('owner', 'user_name email');
      if (!cat) {
        next(new CustomError('No cat found', 404));
        return;
      }
      const output: MessageResponse = {
        message: 'Cat updated',
        data: cat,
      };
      res.json(output);
    }
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catDeleteAdmin - only admin can delete cat
const catDeleteAdmin = async (
  req: Request<{id: string}, {}, Cat>,
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
      throw new CustomError(messages, 400);
    }
    if (res.locals.user.role === 'admin') {
      const cat = await catModel
        .findByIdAndDelete(req.params.id)
        .populate('owner');
      if (!cat) {
        next(new CustomError('No cat found', 404));
        return;
      }
      const output: MessageResponse = {
        message: 'Cat deleted',
        data: cat,
      };
      res.json(output);
    }
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catDelete - only owner can delete cat
const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    const cat = await catModel
      .findByIdAndDelete(req.params.id)
      .populate('owner');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    const output: MessageResponse = {
      message: 'Cat deleted',
      data: cat,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catPut - only owner can update cat
const catPut = async (
  req: Request<{id: string}, {}, Cat>,
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
      throw new CustomError(messages, 400);
    }
    const cat = await catModel
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .populate('owner', 'user_name email');
    if (!cat) {
      next(new CustomError('No species found', 404));
      return;
    }
    const output: MessageResponse = {
      message: 'Cat updated',
      data: cat,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catGet - get cat by id
const catGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const cat = await catModel.findById(req.params.id).populate('owner');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catListGet - get all cats
const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await catModel.find().populate('owner');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

// - catPost - create new cat
const catPost = async (
  req: Request<{}, {}, Cat>,
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
      throw new CustomError(messages, 400);
    }
    if (!req.file) {
      throw new CustomError('file not found', 400);
    }

    req.body.location = res.locals.coords;
    req.body.owner = res.locals.user._id;
    req.body.filename = req.file.filename;
    console.log(req.body);
    const cat = await catModel.create(req.body);
    await cat.populate('owner');
    const output: MessageResponse = {
      message: 'Cat created',
      data: cat,
    };
    res.json(output);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catDelete,
  catGet,
  catListGet,
  catPost,
  catPut,
  catPutAdmin,
  catDeleteAdmin,
};

// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat
