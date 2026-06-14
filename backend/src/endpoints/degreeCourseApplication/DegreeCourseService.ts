import { DegreeCourse } from "./DegreeCourseModel";

export class DegreeCourseService {

    public static async getAllCourses(filter: any = {}) {
        return await DegreeCourse.find(filter);
    }

    public static async getCourse(id: string) {
        return await DegreeCourse.findById(id);
    }

    public static async createCourse(data: any) {
        return await DegreeCourse.create(data);
    }

    public static async updateCourse(id: string, data: any) {
        return await DegreeCourse.findByIdAndUpdate(id, data, { new: true });
    }

    public static async deleteCourse(id: string) {
        const result = await DegreeCourse.findByIdAndDelete(id);
        return result !== null;
    }
}
