import axiosInstance from './axiosInstance'

export const login = ({ email, password }) =>
  axiosInstance.post('/user/login', { email, password }).then((r) => r.data.data)

export const signup = ({ email, password, nickname }) =>
  axiosInstance.post('/user/signup', { email, password, nickname }).then((r) => r.data.data)

export const checkNickname = (nickname) =>
  axiosInstance.get('/user/check', { params: { nickname } }).then((r) => r.data)

export const deleteAccount = (userId) =>
  axiosInstance.delete(`/user/${userId}`).then((r) => r.data)

export const updateUser = (userId, body) =>
  axiosInstance.patch(`/user/update/${userId}`, body).then((r) => r.data.data)
