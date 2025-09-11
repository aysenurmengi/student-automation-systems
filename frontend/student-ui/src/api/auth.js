import { http } from "./http";

export const AuthApi = {
    loginAdmin: (userName, password) =>
        http.post("/Auth/login", { userName, password }),
    loginStudent: (number, password) =>
        http.post("Auth/login/student", { number, password }),
    loginTeacher: (firstName, lastName, password) =>
        http.post("Auth/login/teacher", { firstName, lastName, password }),
    me: () => http.get("/Auth/me"),
    logout: () => http.post("/Auth/logout"),
    
}