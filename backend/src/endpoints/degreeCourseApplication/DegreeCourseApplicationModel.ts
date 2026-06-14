import mongoose, { Schema, Document } from 'mongoose';

export interface DegreeCourseApplication extends Document {
    applicantUserID: string;
    degreeCourseID: string;
    targetPeriodYear: number;
    targetPeriodShortName: string;
    status?: string
}

const DegreeCourseApplicationSchema: Schema = new mongoose.Schema({
    applicantUserID: { type: String, required: true },
    degreeCourseID: { type: String, required: true },
    targetPeriodYear: { type: Number, required: true },
    targetPeriodShortName: { type: String, required: true },
    status: { type: String, enum: ["angelegt", "angenommen", "abgelehnt"], default:"angelegt" }
});

// 每个用户每个课程每个学期只能有一条申请
DegreeCourseApplicationSchema.index(
    { applicantUserID: 1, degreeCourseID: 1, targetPeriodShortName: 1 },
    { unique: true }
);

DegreeCourseApplicationSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const DegreeCourseApplicationModel = mongoose.model<DegreeCourseApplication>(
    'DegreeCourseApplication',
    DegreeCourseApplicationSchema
);

export default DegreeCourseApplicationModel;