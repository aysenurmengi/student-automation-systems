import { http } from "./http";

export const AuthApi = {
  me:           () => http.get("/Auth/me"),
  loginAdmin:   (userName, password) => http.post("/Auth/login", { userName, password }),
  loginStudent: (number, password)   => http.post("/Auth/login/student", { number, password }),
  loginTeacher: (firstName, lastName, password) =>
                                      http.post("/Auth/login/teacher", { firstName, lastName, password }),
  logout:       () => http.post("/Auth/logout"),
};
