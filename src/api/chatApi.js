import axiosInstance from './axiosInstance'

export const getRoomList = (userId) =>
  axiosInstance.get(`/chat/${userId}`).then((r) => r.data.data)

export const searchRoomList = (userId, keyword) =>
  axiosInstance
    .get(`/chat/${userId}/search`, { params: { keyword } })
    .then((r) => r.data.data)

export const createRoom = ({ userId, bookId, topic }) =>
  axiosInstance.post('/chat/rooms', { userId, bookId, topic }).then((r) => r.data.data)

export const getMessages = (roomId, userId) =>
  axiosInstance
    .get(`/chat/rooms/${roomId}/messages`, { params: { userId } })
    .then((r) => r.data.data)

export const sendMessage = (roomId, { userId, content }) =>
  axiosInstance
    .post(`/chat/rooms/${roomId}/message`, { userId, content })
    .then((r) => r.data.data)

export const deleteRoom = (roomId, userId) =>
  axiosInstance
    .delete(`/chat/rooms/${roomId}/delete`, { params: { userId } })
    .then((r) => r.data.data)
