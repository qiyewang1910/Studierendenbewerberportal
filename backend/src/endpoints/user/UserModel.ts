import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
    userID: string;
    firstName: string;
    lastName: string;
    isAdministrator: boolean;
    password: string;
    profileBilderPath?: string;
    email?: string;
    isActive: boolean;
    activationToken?: string;
}

const UserSchema: Schema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isAdministrator: { type: Boolean, default: false },
    password: { type: String, required: true },
    profileBilderPath: { type: String },                                          
    email: { type: String },
    isActive: { type: Boolean, default: false },
    activationToken: { type: String }
});

UserSchema.set('toJSON', {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret._v;
      return ret;
    }
}); 

const UserModel = mongoose.model<User>('User', UserSchema);  
export default UserModel;