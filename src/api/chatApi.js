import axiosInstance from './axiosInstance'

const unwrap = (response) => response.data?.data ?? response.data

export const getRoomList = (userId) =>
  axiosInstance.get(`/chat/${userId}`).then(unwrap)

export const searchRoomList = (userId, keyword) =>
  axiosInstance
    .get(`/chat/${userId}/search`, { params: { keyword } })
    .then(unwrap)

export const createRoom = ({ userId, bookId, topic }) =>
  axiosInstance.post('/chat/rooms', { userId, bookId, topic }).then(unwrap)

export const createNoBookRoom = ({ userId, topic }) =>
  axiosInstance.post('/chat/rooms/nobook', { userId, topic }).then(unwrap)

export const getMessages = (roomId, userId) =>
  axiosInstance
    .get(`/chat/rooms/${roomId}/messages`, { params: { userId } })
    .then(unwrap)

export const sendMessage = (roomId, { userId, content }) =>
  axiosInstance
    .post(`/chat/rooms/${roomId}/message`, { userId, content })
    .then(unwrap)

export const deleteRoom = (roomId, userId) =>
  axiosInstance
    .delete(`/chat/rooms/${roomId}/delete`, { params: { userId } })
    .then(unwrap)
