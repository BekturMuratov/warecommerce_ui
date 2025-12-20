// utils/authHeader.ts
import Cookies from "js-cookie";

export default function authHeader() {
  const token = Cookies.get("access_token");

  if (token) {
    return {
      Authorization: "Bearer " + token,
    };
  }

  return {};
}
