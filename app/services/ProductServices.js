import axios from "axios";
import authHeader from "./AuthHeader";

class ProductService {
  getApiUrl() {
    const config = useRuntimeConfig();
    return config.public.API_URL;
  }

  async getDvhList(params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/products/dvh-list", {
        headers: authHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при загрузке DVH:", error);
      throw error;
    }
  }

  async getReleasedDvhList(params = {}) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(api + "/products/dvh-released-list", {
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
      const response = await axios.get(`${api}/products/dvh/${dvh_number}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (err) {
      console.error('Ошибка получения DVH detail:', err);
      throw err;
    }
  }

  async getReleasedDvhDetail(dvh_number) {
    const api = this.getApiUrl();
    try {
      const response = await axios.get(`${api}/products/released-dvh/${dvh_number}`, {
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
      const response = await axios.get(`${api}/products/generate-pdf/${dvh_number}`, {
        headers: authHeader(),
        responseType: "arraybuffer"
      });
      return response;
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      throw error;
    }
  }

  async releaseProducts(payload) {
    const api = this.getApiUrl();

    try {
      const response = await axios.post(`${api}/products/release`, payload, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка выпуска товаров:", error);
      throw error;
    }
  }
}

export default new ProductService();
