import axios from "axios";

const api = axios.create({
    baseURL: "http://localnando.ddns.net:8085/Sistema-de-biblioteca-api",
});

export default api;
