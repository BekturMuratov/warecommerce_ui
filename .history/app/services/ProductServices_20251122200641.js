import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class ProductService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL;
}
getDvhList() {
 const api = this.getApiUrl();

 const response = await axios.get(api + "products/dvh-list", {headers: authHeader()})
 return response.data;
}getDvhList() {
 const api = this.getApiUrl();

 const response = await axios.get(api + "products/dvh-list", {headers: authHeader()})
 return response.data;
}

}

export default new ProductService();
