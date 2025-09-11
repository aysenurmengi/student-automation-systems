import { http } from './http'

export const UsersApi = {
    //student
    listStudents: () => http.get('/students'),
    createStudent: (payload) => http.post('/students', payload),

    //teacher
    listTeachers: () => http.get('/teachers'),
    createTeacher: (payload) => http.post('/teachers', payload),
}