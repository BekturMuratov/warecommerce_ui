export default function authHeader() {
 let user = localStorage.getItem('access_token');

 if (user) {
   return { Authorization: 'Bearer ' + user };
 } else {
   return {
   
   };
 }
}