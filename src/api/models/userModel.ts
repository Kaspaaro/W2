// TODO: mongoose schema for user
import mongoose, {Schema, Document} from 'mongoose';

interface GetUser extends Document {
  user_name: string;
  email: string;
  password: string;
  role: string;
}

const userSchema: Schema = new Schema({
  user_name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true},
});
const userModel = mongoose.model<GetUser>('User', userSchema);

export {userModel, GetUser};
