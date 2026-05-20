import axiosInstance from './axiosInstance'

export const login = ({ email, password }) =>
  axiosInstance.post('/user/login', { email, password }).then((r) => r.data.data)

export const signup = ({ email, password, nickname }) =>
  axiosInstance.post('/user/signup', { email, password, nickname }).then((r) => r.data.data)
