import axios from "axios";

const api = axios.create({
    baseURL: "https://sistemadebibliotecaapi.onrender.com",
});

export default api;
