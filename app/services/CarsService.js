import axios from "axios";
import authHeader from "./AuthHeader";

class CarsService {
      getApiUrl() {
    const config = useRuntimeConfig();
    return config.public.API_URL;
  }

  getAllCarsList(params = { }) {
    return axios.get(`${this.getApiUrl()}/cars/find-all-cars`, { headers: authHeader(), params });
  }


  createCar(data) {
    return axios.post(`${this.getApiUrl()}/cars`, data, { headers: authHeader() });
  }

async getDvhList(params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/cars/unique-dvh", {
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при загрузке DVH:", error);
      throw error;
    }
  }

   async getDvhDetail(dvh_number) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(`${api}/cars/dvh/${dvh_number}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (err) {
      console.error('Ошибка получения DVH detail:', err);
      throw err;
    }
  }
  async generatePdf(dvh_number) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(`${api}/cars/generate-pdf/${dvh_number}`, {
        headers: authHeader(),
        responseType: "arraybuffer"
      });
      return response;
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      throw error;
    }
  }  
}

export default new CarsService();