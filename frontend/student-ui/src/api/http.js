import axios from "axios";

export const http = axios.create(
    {
        baseURL:"/api",
        withCredentials: true, //cookie-based old için
        headers: {
            "Content-Type": "application/json"
        }
    }
)