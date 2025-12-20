import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:5000/auth/local/";

class AuthService {
  async login(user) {
    return axios
      .post(API_URL + "signin", {
        email: user.email,
        password: user.password,
      })
      .then((response) => {
        const data = response.data;

        if (data.refresh_token) {
          Cookies.set("access_token", data.access_token, { expires: 7 });
          Cookies.set("refresh_token", data.refresh_token, { expires: 7 });

          Cookies.set("user_id", data.user_id, { expires: 7 });
          Cookies.set("user_name", data.user_name, { expires: 7 });
          Cookies.set("warehouse_id", data.warehouse_id, { expires: 7 });
          Cookies.set("warehouse_name", data.warehouse, { expires: 7 });
          Cookies.set("role", data.role, { expires: 7 });
          Cookies.set(
            "place_of_customs_clearance_id",
            data.place_of_customs_clearance_id,
            { expires: 7 }
          );
          Cookies.set("customs_department", data.customs_department, {
            expires: 7,
          });
        }

        return data;
      });
  }

  logout() {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_id");
    Cookies.remove("user_name");
    Cookies.remove("role");
    Cookies.remove("warehouse_id");
    Cookies.remove("warehouse_name");
    Cookies.remove("place_of_customs_clearance_id");
    Cookies.remove("customs_department");
  }

  register(user) {
    return axios.post(API_URL + "signup", {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    });
  }
}

export default new AuthService();
