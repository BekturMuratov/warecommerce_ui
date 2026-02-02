import axios from "axios";
import authHeader from "./AuthHeader";

class PDFService {
  getApiUrl() {
    const config = useRuntimeConfig();
    return config.public.PDF_URL
  }

  /**
   * Загрузка и обработка PDF
   */
  async uploadPdf(file) {
    const api = this.getApiUrl();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${api}/upload`, formData, {
        headers: {
          ...authHeader(),
          // ВАЖНО: axios сам выставит multipart boundary
        }
      });

      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки PDF:", error);
      throw error;
    }
  }
}

export default new PDFService();
