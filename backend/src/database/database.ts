import mongoose from 'mongoose';
import config from '../config/config.json';
import UserModel from '../endpoints/user/UserModel';
import bcrypt from 'bcrypt';

export async function connectDatabase() {
  await mongoose.connect(config.db.url);
  console.log("DB verbunden");

  const admin = await UserModel.findOne({ userID: "admin" });
  if (!admin) {
    const passHash = await bcrypt.hash("123", 10);
    await UserModel.create({
      userID: "admin",
      firstName: "Admin",
      lastName: "Admin",
      password: passHash,
      isAdministrator: true,
      isActive: true,
    });
    console.log("Admin erstellt");
  }
}
