import axiosInstance from './axiosInstance'

const toErrorMessage = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value?.message === 'string') return value.message
  if (typeof value?.error === 'string') return value.error
  return '요청을 처리하지 못했습니다.'
}

const unwrap = (response) => {
  const body = response.data

  if (body?.isSuccess === false) {
    throw {
      status: body.httpStatus || response.status,
      message: toErrorMessage(body.message) || '요청을 처리하지 못했습니다.',
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

export const checkEmail = (email) =>
  axiosInstance.get('/user/check/email', { params: { email } }).then(unwrap)

export const deleteAccount = (userId) =>
  axiosInstance.delete(`/user/${userId}`).then(unwrap)

export const getUserProfile = (userId) =>
  axiosInstance.get(`/user/${userId}`).then(unwrap)

export const updateUser = (userId, body) =>
  axiosInstance.patch(`/user/update/${userId}`, { userId, ...body }).then(unwrap)

export const updateProfileImage = (userId, file) => {
  const formData = new FormData()
  formData.append('profileImg', file)

  return axiosInstance
    .post(`/user/updateimg/${userId}`, formData)
    .then(unwrap)
}
