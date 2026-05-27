export const NICKNAME_RULE_MESSAGE =
  '닉네임은 3~10자의 한글, 영문 소문자, 숫자만 사용할 수 있어요.'

export const nicknameRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]{3,10}$/

export const isValidNickname = (value) => nicknameRegex.test(value.trim())
