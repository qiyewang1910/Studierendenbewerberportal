import UserModel, { User } from './UserModel';
import bcrypt from 'bcrypt';

export class UserService {

    // Get all users
    public static async getAllUsers() {
        return await UserModel.find();
    }

    // Get user by ID
    public static async getUser(requesterID: string, isAdmin: boolean, targetUserID: string) {
        if (!isAdmin && requesterID !== targetUserID) {
            throw new Error("Not Authorized");  // 授权判断在 Service 里
        }
        return await UserModel.findOne({ userID: targetUserID });
    }

    // Create user
    public static async createUser(userData: User) {
        if (!userData.password) {
            throw new Error('Password is required');
        }

        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);

        userData.isActive = true; // 为了创建用户时配合邮件激活
        const newUser = new UserModel(userData);
        return await newUser.save();
    }

    // Update user
    public static async updateUser(
        requesterID: string,
        isAdmin: boolean,
        targetUserID: string,
        updateData: any
    ) {
        if (!isAdmin && requesterID !== targetUserID) {
            throw new Error("Not Authorized");
        }

        const allowedFields = isAdmin
            ? ["firstName", "lastName", "isAdministrator", "password"]
            : ["firstName", "lastName", "password"];

        const update: any = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                update[field] = updateData[field];
            }
        }

        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        }

        return await UserModel.findOneAndUpdate({ userID: targetUserID }, update, { new: true });
    }

    // Delete user
    public static async deleteUser(userID: string) {
        const result = await UserModel.deleteOne({ userID });
        return result.deletedCount > 0; 
    }
 }

 export default UserService;