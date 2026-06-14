import mongoose from "mongoose";

const schema = new mongoose.Schema({
  universityName: String,
  universityShortName: String,
  departmentName: String,
  departmentShortName: String,
  name: String,
  shortName: String,
});

schema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const DegreeCourse = mongoose.model("DegreeCourse", schema);
