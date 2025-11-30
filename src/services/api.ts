import axios from "axios";

const api = axios.create({
    baseURL: "https://bibliotecaapi.alberinando.net",
});

export default api;
