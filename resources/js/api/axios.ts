import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
});

export const axiosBaseQuery = () => async ({ url, method, params, data }: any) => {
  try {
    const result = await axiosInstance({
      url,
      method,
      params,
      data,
    });

    return { data: result.data };
  } catch (axiosError: AxiosError | any) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      },
    };
  }
};
