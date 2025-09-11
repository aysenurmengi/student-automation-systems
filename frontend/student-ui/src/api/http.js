import axios from "axios";

export const http = axios.create(
    {
        baseURL: "http://localhost:5025/api",
        withCredentials: true, //cookie-based old için
        headers: {
            "Content-Type": "application/json"
        }
    }
)