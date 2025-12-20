import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class TariffService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL;
}
getAll() {
 
}

}

export default new TariffService();
