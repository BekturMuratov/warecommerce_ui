import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class ProductService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL;
}
async getDvhList(params = {}) {
 const api = this.getApiUrl()

 try {
   const response = await axios.get(api + "/products/dvh-list", {
     headers: authHeader(),
     params // axios автоматически сериализует объект в query string
   })
   return response.data
 } catch (error) {
   console.error("Ошибка при загрузке DVH:", error)
   throw error
 }
}
async getDvhDetail(dvh_number) {
 const api = this.getApiUrl()
  try {
    const response = await axios.get(`${api}/products/dvh/${dvh_number}`, {
      headers: authHeader()
    })
    return response.data
  } catch (err) {
    console.error('Ошибка получения DVH detail:', err)
    throw err
  }
}


}

export default new ProductService();
