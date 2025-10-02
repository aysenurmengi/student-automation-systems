import {http} from "./http";

export const GradesApi = {
    add: (payload) => http.post("/Grades", payload),
    my: () => http.get("Grades/my"),
}