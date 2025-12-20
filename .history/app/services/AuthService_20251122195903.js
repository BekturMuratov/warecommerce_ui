import axios from "axios";
import Cookies from "js-cookie";
import authHeader from "./AuthHeader";

class AuthService {
 getApiUrl() {
  const config = useRuntimeConfig();
  return config.public.API_URL + "/auth/local/";
}
  async login(user) {
    const api = this.getApiUrl();
    
    const response = await axios.post(api + "signin", {
      email: user.email,
      password: user.password,
    });

    const data = response.data;

    if (data.refresh_token) {
      Cookies.set("access_token", data.access_token, { expires: 7 });
      Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
      Cookies.set("user_id", data.user_id, { expires: 7 });
      Cookies.set("user_name", data.user_name, { expires: 7 });
      Cookies.set("role", data.role, { expires: 7 });
    }

    return data;
  }

  async signup(user) {
    const api = this.getApiUrl();

    const response = await axios.post(api + "signup", {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    });

    return response.data;
  }

  async getUsers() {
    const api = this.getApiUrl();
    const token = Cookies.get("access_token");

    const response = await axios.get(api + '/users', {
     headers: authHeader()
   })

    return response.data;
  }
}

export default new AuthService();
