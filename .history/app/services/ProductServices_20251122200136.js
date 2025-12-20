import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class ProductService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL;
}
}

export default new ProductService();
