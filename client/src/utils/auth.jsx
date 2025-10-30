export const setToken = (token) => {
  localStorage.setItem("authToken", token);
};
export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const removeToken = () => {
  localStorage.removeItem("authToken");
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  const token = getToken();
  return token ? true : false;
};


export const clearAuth = ()=>{
    removeToken()
    removeUser()
}