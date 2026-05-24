import axiosInstance from './axiosInstance'

const unwrap = (response) => {
  const body = response.data

  if (body?.isSuccess === false) {
    throw {
      status: body.httpStatus || response.status,
      message: body.message || '요청을 처리하지 못했습니다.',
      data: body,
    }
  }

  return body?.data ?? body
}

export const login = ({ email, password }) =>
  axiosInstance.post('/user/login', { email, password }).then(unwrap)

export const signup = ({ email, password, nickname }) =>
  axiosInstance.post('/user/signup', { email, password, nickname }).then(unwrap)

export const checkNickname = (nickname) =>
  axiosInstance.get('/user/check', { params: { nickname } }).then(unwrap)

export const deleteAccount = (userId) =>
  axiosInstance.delete(`/user/${userId}`).then(unwrap)

export const updateUser = (userId, body) =>
  axiosInstance.patch(`/user/update/${userId}`, body).then(unwrap)
