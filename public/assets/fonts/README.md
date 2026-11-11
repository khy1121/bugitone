# 폰트 서브셋

장식용 폰트는 실제로 쓰는 글자만 남긴 woff2 서브셋을 사용합니다.

| 파일 | 원본 | 포함 글자 |
|---|---|---|
| `TropiLand-subset.woff2` | TropiLand.ttf (77KB) | 기본 라틴 문자 (U+0020-007E) |
| `tvNEnjoystories-subset.woff2` | tvNEnjoystoriesOTF.ttf (2.9MB) | "펼치는 순간, 나를 다독이다" + 기본 라틴 문자 |

tvN 폰트로 표시하는 문구를 바꾸면 원본 ttf로 다시 만들어야 합니다 (원본은 git 기록에 있습니다).

```bash
pip install fonttools brotli
python -m fontTools.subset tvNEnjoystoriesOTF.ttf \
  --text="펼치는 순간, 나를 다독이다" --unicodes="U+0020-007E" \
  --flavor=woff2 --layout-features='*' --output-file=tvNEnjoystories-subset.woff2
```
