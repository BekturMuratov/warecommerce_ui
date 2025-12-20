import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class TariffService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL;
}
async getAll(warehouse_id) {
 const api = this.getApiUrl()

 try {
   const response = await axios.get(api + `/tariffs/warehouse/${warehouse_id}`, {
     headers: authHeader(),
     params // axios автоматически сериализует объект в query string
   })
   return response.data
 } catch (error) {
   console.error("Ошибка при загрузке DVH:", error)
   throw error
 }
}

}

export default new TariffService();
