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

export const validateEmotionInput = (inputText) =>
  axiosInstance.post('/emotion-inputs/input-text', { inputText }).then(unwrap)

export const createEmotionAnalysis = ({ userId, inputText, emotionTag, comfortMethod }) =>
  axiosInstance
    .post('/emotion-inputs', {
      userId,
      inputText,
      emotionTag,
      comfortMethod,
    })
    .then(unwrap)
