import axios from "axios";
import authHeader from "./AuthHeader";

class ProductService {
      getApiUrl() {
    const config = useRuntimeConfig();
    return config.public.API_URL;
  }

  getAllOwnersList(params = { }) {
    return axios.get(`${this.getApiUrl()}/owners/find-all-owners`, { headers: authHeader(), params });
  }


  createOwner(data) {
    return axios.post(`${this.getApiUrl()}/owners`, data, { headers: authHeader() });
  }

  findOwnerByInn(data) {
    return axios.get(`${this.getApiUrl()}/owners/find-by-inn/${data}`, { headers: authHeader() });  
  }
}

export default new ProductService();