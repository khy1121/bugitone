export const NICKNAME_RULE_MESSAGE =
  '3~10 사이의 한글, 영어, 소문자, 숫자로만 입력해주세요.'

export const nicknameRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]{3,10}$/

export const isValidNickname = (value) => nicknameRegex.test(value.trim())
