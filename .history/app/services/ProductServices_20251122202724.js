import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class ProductService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL;
}
async getDvhList(params: { pageNumber, pageSize, startDate,endDate} = {}) {
 const api = this.getApiUrl()
 
 const response = await axios.get(api + 'products/dvh-list', {
   headers: authHeader(),
   params // axios автоматически сериализует объект в query string
 })

 return response.data
}

}

export default new ProductService();
