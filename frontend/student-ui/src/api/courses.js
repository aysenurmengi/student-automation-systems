import { http } from "./http";

export const CoursesApi = {
    list: () => http.get("/courses"),
    listComments: (courseId) => http.get(`/courses/${courseId}/comments`),
    listStudents: (courseId) => http.get(`/Courses/${courseId}/students`),
    create: (payload) => http.post("/courses", payload),
    createComment: (courseId, payload) =>http.post(`/courses/${courseId}/comments`, payload),
    addEnrollment: (courseId, payload) => http.post(`/courses/${courseId}/enroll`, payload),
}