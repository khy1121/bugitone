import axiosInstance from './axiosInstance'

const unwrap = (response) => {
  const body = response.data

  if (body?.isSuccess === false || body?.success === false) {
    throw {
      status: body.httpStatus || response.status,
      message: body.message || '요청을 처리하지 못했습니다.',
      data: body,
    }
  }

  return body?.data ?? body
}

export const searchBooks = (keyword, options = {}) =>
  axiosInstance
    .get('/book/search', {
      params: {
        query: keyword,
        user_id: options.userId,
        query_type: options.queryType,
        sort: options.sort,
        page: options.page,
        size: options.size,
      },
    })
    .then(unwrap)

export const getMyBooks = (userId) =>
  axiosInstance.get('/main-study', { params: { userId } }).then(unwrap)

export const addMyBook = (userId, book) =>
  axiosInstance.post('/main-study', book, { params: { userId } }).then(unwrap)

export const getBookDetail = (isbn, userId) =>
  axiosInstance.get(`/books/${isbn}`, { params: { userId } }).then(unwrap)

export const updateMyBook = (mainId, userId, body) =>
  axiosInstance.patch(`/main-study/${mainId}`, body, { params: { userId } }).then(unwrap)

export const removeMyBook = (mainId, userId) =>
  axiosInstance.delete(`/main-study/${mainId}`, { params: { userId } }).then(unwrap)

export const getBookMemos = (mainId) =>
  axiosInstance.get(`/main-study/${mainId}/memos`).then(unwrap)

export const getAllMemos = (userId) =>
  axiosInstance.get(`/memos/${userId}`).then(unwrap)

export const getMemoDetail = (userId, memoId) =>
  axiosInstance.get(`/memos/${userId}/${memoId}`).then(unwrap)

export const createMemo = (body) =>
  // 백엔드가 인증 토큰 외에 user_id를 요구하면 여기 params에 추가해야 합니다.
  axiosInstance.post('/memos', body).then(unwrap)

export const updateMemo = (memoId, body) =>
  // PATCH 스펙은 title/content 중심입니다. 백엔드가 mainId를 요구하면 body에 추가해야 합니다.
  axiosInstance.patch(`/memos/${memoId}`, body).then(unwrap)

export const deleteMemo = (memoId) =>
  axiosInstance.delete(`/memos/${memoId}`).then(unwrap)
