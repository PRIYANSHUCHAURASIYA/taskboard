//I used Axios because it provides a simple API for making HTTP requests
//  and supports features like interceptors,
//  which are useful for handling authentication tokens globally

import axios from "axios";

// we can also use axios.post("") , but here have code repeation;
// thats why i use here axios.create


//I created a reusable Axios instance with a common base URL so that
//  I don't have to repeat the backend URL in every API request

const API = axios.create({
    baseURL : 'http://localhost:5000',
}) ;

// interceptors => An interceptor allows us to execute logic before a request is sent or after a
// response is received


// Attach token automatically to every request
API.interceptors.request.use((req) =>{
    const token = localStorage.getItem('token');
    if(token){
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});



// if token is invalid/expaired , auto-logOut

API.interceptors.response.use((response) =>{
    response,
    (error) =>{
        if(error.response?.status === 401){
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
})

export default API;
