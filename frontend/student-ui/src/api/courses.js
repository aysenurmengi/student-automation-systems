import { http } from "./http";

export const CoursesApi = {
    list: () => http.get("/courses"),
    create: (payload) => http.post("/courses", payload),
}