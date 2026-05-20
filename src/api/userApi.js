import axiosInstance from './axiosInstance'

export const login = ({ email, password }) =>
  axiosInstance.post('/user/login', { email, password }).then((r) => r.data.data)

export const signup = ({ email, password, nickname }) =>
  axiosInstance.post('/user/signup', { email, password, nickname }).then((r) => r.data.data)

// 닉네임 중복 확인 — isSuccess: true면 사용 가능
export const checkNickname = (nickname) =>
  axiosInstance.get('/user/check', { params: { nickname } }).then((r) => r.data)
