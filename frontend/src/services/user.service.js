import axiosInstance from "./url.service";


export const sendOtp = async (phoneNumber,phoneSuffix,email) => {

  try {
    const response = await axiosInstance.post('/auth/send-otp', {
      phoneNumber,
      phoneSuffix,
      email,
    });
    return response.data;
  } catch (error) {
    console.error(error.message)
  }
}

export const verifyOtp = async ({ phoneNumber, phoneSuffix, email, otp }) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', {
      phoneNumber,
      phoneSuffix,
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error; // so UI can catch and show toast
  }
};


export const updateUserProfile = async (updateData) => {

  try {
    const response = await axiosInstance.put('/auth/update-profile', updateData);
    return response.data;
  } catch (error) {
    console.error(error.message)
  }
}
  

export const checkUserAuth = async () => {

  try {
    const response = await axiosInstance.get('/auth/check-auth');
    if(response.data.success === 'success') {
      return {isAuthenticated: true, user: response?.data?.data}
    }else if(response.data.success === 'error') {
      return {isAuthenticated: false, user: null}
    }
  } catch (error) {
    console.error(error.message)
  }
}



export const logoutUser = async () => {

  try {
    const response = await axiosInstance.get('/auth/logout');
    return response.data;
  } catch (error) {
    console.error(error.message)
  }
}


export const getAllUsers = async () => {

  try {
    const response = await axiosInstance.get('/auth/users');
    return response.data;
  } catch (error) {
    console.error(error.message)
  }
}