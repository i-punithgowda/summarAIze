import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

export const summarizePR = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/summarize-pr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
}; 