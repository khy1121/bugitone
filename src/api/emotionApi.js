import axiosInstance from './axiosInstance'

const EMOTION_ANALYSIS_TIMEOUT_MS = 30000

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
    .post(
      '/emotion-inputs',
      {
        userId,
        inputText,
        emotionTag,
        comfortMethod,
      },
      {
        timeout: EMOTION_ANALYSIS_TIMEOUT_MS,
      },
    )
    .then(unwrap)

export const getMonthlyCharacters = (userId) =>
  axiosInstance.get(`/emotion-inputs/${userId}/characters`).then(unwrap)

export const getMonthlyEmotions = (userId) =>
  axiosInstance.get(`/emotion-inputs/${userId}/emotions`).then(unwrap)
