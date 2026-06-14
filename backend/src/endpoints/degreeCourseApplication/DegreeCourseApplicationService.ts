import DegreeCourseApplicationModel from './DegreeCourseApplicationModel';
import { DegreeCourse } from './DegreeCourseModel';
import UserModel from '../user/UserModel';
import { EmailService } from '../../utils/EmailService';

export class DegreeCourseApplicationService {

    public static async getAllApplications(
        requesterID: string, 
        isAdmin: boolean, 
        filterUserID?: string, 
        filterCourseID?: string
    ) {
        if (isAdmin) {
            const filter: any = {};
            if (filterUserID) filter.applicantUserID = filterUserID;
            if (filterCourseID) filter.degreeCourseID = filterCourseID;
            return await DegreeCourseApplicationModel.find(filter);
        }
        return await DegreeCourseApplicationModel.find({ applicantUserID: requesterID });
    }

    public static async getApplication(id: string, requesterID: string, isAdmin: boolean) {
        const application = await DegreeCourseApplicationModel.findById(id);
        if (!application) return null;
        if (!isAdmin && application.applicantUserID !== requesterID) {
            throw new Error("Forbidden");
        }
        return application;
    }

    public static async createApplication(data: any, requesterID: string, isAdmin: boolean) {
        if (!isAdmin && data.applicantUserID && data.applicantUserID !== requesterID) {
            throw new Error("Forbidden");
        }
        const applicantUserID = isAdmin && data.applicantUserID ? data.applicantUserID : requesterID;
        
        // const course = await DegreeCourse.findById(data.degreeCourseID);
        // if (!course) throw new Error("Course not found");  根本无法到这里

        let course;
        try {   // 格式非法无法识别
            course = await DegreeCourse.findById(data.degreeCourseID);
        } catch {
            throw new Error("Degree course not found");
        }
        if (!course) throw new Error("Degree course not found");
        const newApplication = new DegreeCourseApplicationModel({
            applicantUserID,
            degreeCourseID: data.degreeCourseID,
            targetPeriodYear: data.targetPeriodYear,
            targetPeriodShortName: data.targetPeriodShortName
        });
        return await newApplication.save();
    }

    public static async updateApplication(id: string, updateData: any, requesterID: string, isAdmin: boolean) {
        const application = await DegreeCourseApplicationModel.findById(id);
        if (!application) return null;
        if (!isAdmin && application.applicantUserID !== requesterID) {
            throw new Error("Not Authorized");
        }

        const update: any = {};
        if (isAdmin) {
            update.degreeCourseID = updateData.degreeCourseID ?? application.degreeCourseID;
            update.applicantUserID = updateData.applicantUserID ?? application.applicantUserID;
            // 只有 admin 能修改 status
            if (updateData.status) update.status = updateData.status;
        }
        update.targetPeriodYear = updateData.targetPeriodYear ?? application.targetPeriodYear;
        update.targetPeriodShortName = updateData.targetPeriodShortName ?? application.targetPeriodShortName;

        const updated = await DegreeCourseApplicationModel.findByIdAndUpdate(id, update, { new: true });

        // 如果 status 发生变化，发邮件通知申请人
        if (updated && update.status && update.status !== application.status) {
            const applicant = await UserModel.findOne({ userID: application.applicantUserID });
            if (applicant && applicant.email) {
                const name = `${applicant.firstName} ${applicant.lastName}`;
                await EmailService.sendStatusChangeEmail(applicant.email, name, update.status);
            }
        }

        return updated;
    }

    public static async deleteApplication(id: string, requesterID: string, isAdmin: boolean) {
        const application = await DegreeCourseApplicationModel.findById(id);
        if (!application) return false;
        if (!isAdmin && application.applicantUserID !== requesterID) {
            throw new Error("Not Authorized");
        }
        await DegreeCourseApplicationModel.findByIdAndDelete(id);
        return true;
    }
}
