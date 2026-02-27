import axios from "axios";
import authHeader from "./AuthHeader";

class PDFService {
  getApiUrl() {
    const config = useRuntimeConfig();
    return config.public.PDF_URL;
  }

  async uploadPdf(file: File) {
    const api = this.getApiUrl();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${api}/api/parse/dvh`,
        formData,
        {
          headers: {
            ...authHeader()
            // Content-Type НЕ УКАЗЫВАЕМ
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки PDF:", error);
      throw error;
    }
  }

  async uploadCarPdf(file: File) {
    const api = this.getApiUrl();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${api}/upload/auto`,
        formData,
        {
          headers: {
            ...authHeader()
            // Content-Type НЕ УКАЗЫВАЕМ
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки PDF:", error);
      throw error;
    }
  }
}

export default new PDFService();
