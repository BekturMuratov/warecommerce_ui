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


  async getReleasedDvhDetail(dvh_number) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(`${api}/cars/released-dvh/${dvh_number}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (err) {
      console.error('Ошибка получения DVH detail:', err);
      throw err;
    }
  }

   async generateReleasedPdf(dvh_number) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(`${api}/cars/generate-released-pdf/${dvh_number}`, {
        headers: authHeader(),
        responseType: "arraybuffer"
      });
      return response;
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      throw error;
    }
  }


async releaseCars(payload) {
  const api = this.getApiUrl();
  try {
    const response = await axios.post(
      `${api}/cars/release`,
      payload,
      {
        headers: authHeader(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка выпуска автомобилей:", error);
    throw error;
  }
}

  async getReleasedDvhList(params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/cars/dvh-released-list", {
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при загрузке DVH:", error);
      throw error;
    }
  }


  async getAllStocks( params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/cars/stock-report", {
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при загрузке остатка автомобилей:", error);
      throw error;
    }
  }


  async getReleasedStocks( params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/cars/released-report", {
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при загрузке выпущенных автомобилей:", error);
      throw error;
    }
  }

  async exportAllStock(params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/cars/export-stock", {
        headers: authHeader(),
        params,
        responseType: 'arraybuffer' // критично для Excel
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при экспорте остатков автомобилей:", error);
      throw error;
    }
  } 


async exportAllReleasedStock(params = {}) {
  const api = this.getApiUrl();

  const response = await axios.get(
    `${api}/cars/export-released`,
    {
      headers: authHeader(),
      params,
      responseType: 'arraybuffer', // КРИТИЧНО
    }
  );

  return response.data; // ✅ ВОЗВРАЩАЕМ buffer
}

}

export default new CarsService();