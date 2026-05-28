import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { createEmotionAnalysis } from "../../api/emotionApi";
import Loading from "../../components/common/LoadingSpinner/LoadingSpinner";
import { resolveRemoteAssetUrl } from "../../utils/resolveAssetUrl";
import "./ResultPage.scss";

const LOAD_CHAR_SRC = "/assets/character/LoadChar.svg";
const LITTLE_PRINCE_SRC = "/assets/character/LittlePrince.svg";
const PRINCE_SHADOW_SRC = "/assets/character/PrinceShadow.svg";
const RESULT_PIECE_CHAR_SRC = "/assets/character/resultChar.svg";
const COIN_SRC = "/assets/shop/coin.png";
const REGENERATE_COIN_COST = 2;
const RESULT_IMAGE_WIDTH = 393;
const RESULT_IMAGE_PADDING_X = 20;
const RESULT_IMAGE_CARD_WIDTH = RESULT_IMAGE_WIDTH - RESULT_IMAGE_PADDING_X * 2;
const RESULT_IMAGE_BACKGROUND = "#f5f4f3";
const RESULT_IMAGE_FONT = "Pretendard, Arial, sans-serif";
const DEFAULT_CHARACTER_THEME_ID = "littlePrince";

const RESULT_CHARACTER_THEMES = [
  {
    id: "alice",
    aliases: [
      "alice",
      "\uc2e0\ub098\ub294 \uc568\ub9ac\uc2a4",
      "\uc568\ub9ac\uc2a4",
      "\uc774\uc0c1\ud55c \ub098\ub77c\uc758 \uc568\ub9ac\uc2a4",
    ],
    cssBackground:
      "radial-gradient(ellipse 185px 178px at 49.5% 50.2%, rgba(207, 248, 255, 0.98) 0%, rgba(232, 252, 255, 0.62) 48%, rgba(254, 254, 254, 0.98) 95%, #fefefe 100%)",
    canvasStops: [
      [0, "rgba(207, 248, 255, 0.98)"],
      [0.48, "rgba(232, 252, 255, 0.62)"],
      [0.95, "rgba(254, 254, 254, 0.98)"],
      [1, "#fefefe"],
    ],
  },
  {
    id: "anne",
    aliases: [
      "anne",
      "anneshirley",
      "\ucc28\ubd84\ud55c \uc564 \uc15c\ub9ac",
      "\uc564 \uc15c\ub9ac",
      "\ube68\uac04\uba38\ub9ac \uc564",
    ],
    cssBackground:
      "radial-gradient(ellipse 185px 178px at 49.5% 50.2%, rgba(255, 200, 151, 0.98) 0%, rgba(255, 227, 203, 0.78) 48%, rgba(254, 254, 254, 0.98) 95%, #fefefe 100%)",
    canvasStops: [
      [0, "rgba(255, 200, 151, 0.98)"],
      [0.48, "rgba(255, 227, 203, 0.78)"],
      [0.95, "rgba(254, 254, 254, 0.98)"],
      [1, "#fefefe"],
    ],
  },
  {
    id: DEFAULT_CHARACTER_THEME_ID,
    aliases: [
      "littleprince",
      "prince",
      "\uc5b4\ub978\uc774 \ub41c \uc5b4\ub9b0\uc655\uc790",
      "\uc5b4\ub9b0\uc655\uc790",
    ],
    cssBackground:
      "radial-gradient(ellipse 185px 178px at 49.5% 50.2%, rgba(255, 239, 192, 0.98) 0%, rgba(255, 239, 192, 0.76) 24%, rgba(255, 247, 223, 0.46) 56%, rgba(254, 254, 254, 0.98) 95%, #fefefe 100%)",
    canvasStops: [
      [0, "rgba(255, 239, 192, 0.98)"],
      [0.24, "rgba(255, 239, 192, 0.76)"],
      [0.56, "rgba(255, 247, 223, 0.46)"],
      [0.95, "rgba(254, 254, 254, 0.98)"],
      [1, "#fefefe"],
    ],
  },
  {
    id: "redRidingHood",
    aliases: [
      "redridinghood",
      "redhood",
      "red",
      "\uac15\ud574\uc9c4 \ube68\uac04\ubaa8\uc790",
      "\ube68\uac04\ubaa8\uc790",
    ],
    cssBackground:
      "radial-gradient(ellipse 185px 178px at 49.5% 50.2%, rgba(255, 211, 192, 0.98) 0%, rgba(255, 231, 220, 0.62) 52%, rgba(254, 254, 254, 0.98) 95%, #fefefe 100%)",
    canvasStops: [
      [0, "rgba(255, 211, 192, 0.98)"],
      [0.52, "rgba(255, 231, 220, 0.62)"],
      [0.95, "rgba(254, 254, 254, 0.98)"],
      [1, "#fefefe"],
    ],
  },
  {
    id: "peterPan",
    aliases: [
      "peterpan",
      "\uacf5\ud5c8\ud55c \ud53c\ud130\ud32c",
      "\ud53c\ud130\ud32c",
    ],
    cssBackground:
      "radial-gradient(ellipse 185px 178px at 49.5% 50.2%, rgba(194, 215, 176, 0.98) 0%, rgba(224, 234, 215, 0.78) 48%, rgba(254, 254, 254, 0.98) 95%, #fefefe 100%)",
    canvasStops: [
      [0, "rgba(194, 215, 176, 0.98)"],
      [0.48, "rgba(224, 234, 215, 0.78)"],
      [0.95, "rgba(254, 254, 254, 0.98)"],
      [1, "#fefefe"],
    ],
  },
];

const DEFAULT_CHARACTER_THEME =
  RESULT_CHARACTER_THEMES.find((theme) => theme.id === DEFAULT_CHARACTER_THEME_ID) ||
  RESULT_CHARACTER_THEMES[0];

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function getCanvasScale() {
  return Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);
}

function createImageFileName(characterName) {
  const safeName = `${characterName || "result"}`
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30);

  return `nadok-${safeName || "result"}.png`;
}

function normalizeThemeText(value) {
  return `${value ?? ""}`
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function hasThemeToken(candidate, token) {
  if (!token) return false;
  if (token.length <= 3) return candidate === token;
  return candidate.includes(token);
}

function getResultCharacterTheme({
  characterKey,
  characterName,
  characterAuthor,
  characterImage,
}) {
  const candidates = [
    characterKey,
    characterName,
    characterAuthor,
    characterImage,
  ]
    .map(normalizeThemeText)
    .filter(Boolean);

  if (candidates.length === 0) return DEFAULT_CHARACTER_THEME;

  return (
    RESULT_CHARACTER_THEMES.find((theme) => {
      const normalizedId = normalizeThemeText(theme.id);
      const normalizedAliases = theme.aliases.map(normalizeThemeText);

      return candidates.some(
        (candidate) =>
          candidate === normalizedId ||
          hasThemeToken(candidate, normalizedId) ||
          normalizedAliases.some((alias) => hasThemeToken(candidate, alias)),
      );
    }) || DEFAULT_CHARACTER_THEME
  );
}

function createBookCardGradient(ctx, bookY, characterTheme) {
  const gradient = ctx.createRadialGradient(
    RESULT_IMAGE_WIDTH / 2,
    bookY + 174,
    0,
    RESULT_IMAGE_WIDTH / 2,
    bookY + 174,
    190,
  );

  (characterTheme?.canvasStops || DEFAULT_CHARACTER_THEME.canvasStops).forEach(
    ([offset, color]) => {
      gradient.addColorStop(offset, color);
    },
  );

  return gradient;
}

function isExternalHttpUrl(source) {
  try {
    const url = new URL(source, window.location.href);
    return /^https?:$/i.test(url.protocol) && url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

async function getCanvasSafeImageSource(source) {
  if (!isExternalHttpUrl(source)) return { source, cleanup: () => {} };

  const response = await fetch(source, { mode: "cors" });
  if (!response.ok) {
    throw new Error("이미지를 불러오지 못했습니다.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  return {
    source: objectUrl,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = source;
  });
}

async function loadCanvasImage(source, fallbackSource) {
  const candidates = [source, fallbackSource].filter(Boolean);

  for (const candidate of candidates) {
    let cleanup = () => {};

    try {
      const safeSource = await getCanvasSafeImageSource(candidate);
      cleanup = safeSource.cleanup;
      const image = await loadImageElement(safeSource.source);
      return { image, cleanup };
    } catch {
      cleanup();
    }
  }

  return { image: null, cleanup: () => {} };
}

function drawRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  const radii = typeof radius === "number"
    ? { tl: radius, tr: radius, br: radius, bl: radius }
    : { tl: 0, tr: 0, br: 0, bl: 0, ...radius };

  ctx.beginPath();
  ctx.moveTo(x + radii.tl, y);
  ctx.lineTo(x + width - radii.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
  ctx.lineTo(x + width, y + height - radii.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
  ctx.lineTo(x + radii.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
  ctx.lineTo(x, y + radii.tl);
  ctx.quadraticCurveTo(x, y, x + radii.tl, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function fitFontSize(ctx, text, maxWidth, fontWeight, startSize, minSize = 18) {
  let size = startSize;

  while (size > minSize) {
    ctx.font = `${fontWeight} ${size}px ${RESULT_IMAGE_FONT}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }

  return minSize;
}

function splitTextLines(ctx, text, maxWidth, maxLines = Infinity) {
  const paragraphs = `${text || ""}`.replace(/\r\n/g, "\n").split("\n");
  const lines = [];

  for (const paragraph of paragraphs) {
    const chars = Array.from(paragraph);
    let line = "";

    for (const char of chars) {
      const nextLine = line + char;

      if (line && ctx.measureText(nextLine).width > maxWidth) {
        lines.push(line.trimEnd());
        line = char.trimStart();

        if (lines.length >= maxLines) return lines;
      } else {
        line = nextLine;
      }
    }

    if (line || paragraph === "") {
      lines.push(line);
      if (lines.length >= maxLines) return lines;
    }
  }

  return lines;
}

function drawTextLines(ctx, lines, x, y, lineHeight, options = {}) {
  ctx.fillStyle = options.color || "#282723";
  ctx.font = `${options.weight || 400} ${options.size || 16}px ${RESULT_IMAGE_FONT}`;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("이미지 생성에 실패했습니다."));
    }, "image/png");
  });
}

async function createResultImageBlob({
  displayName,
  characterName,
  characterAuthor,
  characterImage,
  bookQuote,
  moodTags,
  methodReason,
  characterTheme,
}) {
  await document.fonts?.ready;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.font = `400 16px ${RESULT_IMAGE_FONT}`;
  const reasonLines = splitTextLines(tempCtx, methodReason, 313);
  tempCtx.font = `600 16px ${RESULT_IMAGE_FONT}`;
  const quoteLines = splitTextLines(tempCtx, `“ ${bookQuote} ”`, 235, 3);

  const pieceCardHeight = Math.max(104, 32 + reasonLines.length * 26);
  const imageHeight =
    48 +
    36 + 8 + 26 + 48 +
    348 +
    54 + 132 +
    54 + 48 + 16 + pieceCardHeight +
    40;
  const scale = getCanvasScale();
  const canvas = document.createElement("canvas");
  canvas.width = RESULT_IMAGE_WIDTH * scale;
  canvas.height = imageHeight * scale;

  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = RESULT_IMAGE_BACKGROUND;
  ctx.fillRect(0, 0, RESULT_IMAGE_WIDTH, imageHeight);

  const characterAsset = await loadCanvasImage(characterImage, LITTLE_PRINCE_SRC);
  const shadowAsset = await loadCanvasImage(PRINCE_SHADOW_SRC);
  const pieceAsset = await loadCanvasImage(RESULT_PIECE_CHAR_SRC);

  const x = RESULT_IMAGE_PADDING_X;
  let y = 48;

  drawTextLines(ctx, [`${displayName}님은...`], x, y, 36, {
    color: "#282723",
    size: 28,
    weight: 700,
  });
  y += 44;

  drawTextLines(ctx, [`${displayName}님의 상태를 정독한 결과에요.`], x, y, 26, {
    color: "#5c5950",
    size: 16,
    weight: 400,
  });
  y += 74;

  const bookY = y;
  const gradient = createBookCardGradient(ctx, bookY, characterTheme);
  drawRoundRect(ctx, x, bookY, RESULT_IMAGE_CARD_WIDTH, 348, 20, gradient);

  const titleSize = fitFontSize(ctx, characterName, 313, 700, 28, 20);
  drawTextLines(ctx, [characterName], RESULT_IMAGE_WIDTH / 2, bookY + 30, 36, {
    color: "#282723",
    size: titleSize,
    weight: 700,
    align: "center",
  });
  drawTextLines(ctx, [`저자 ㅣ ${characterAuthor}`], RESULT_IMAGE_WIDTH / 2, bookY + 70, 18, {
    color: "#5c5950",
    size: 12,
    weight: 400,
    align: "center",
  });

  if (shadowAsset.image) {
    ctx.drawImage(shadowAsset.image, RESULT_IMAGE_WIDTH / 2 - 65, bookY + 220, 130, 22);
  }
  if (characterAsset.image) {
    ctx.drawImage(characterAsset.image, RESULT_IMAGE_WIDTH / 2 - 46, bookY + 98, 92, 140);
  }

  drawTextLines(
    ctx,
    quoteLines,
    RESULT_IMAGE_WIDTH / 2,
    bookY + 252 - ((quoteLines.length - 1) * 13),
    26,
    {
      color: "#42403a",
      size: 16,
      weight: 600,
      align: "center",
    },
  );
  y += 348;

  y += 54;
  drawRoundRect(ctx, x, y, RESULT_IMAGE_CARD_WIDTH, 132, 20, "#fefefe");
  drawTextLines(ctx, [`${displayName}님의 기분 상태`], x + 20, y + 20, 30, {
    color: "#282723",
    size: 22,
    weight: 600,
  });

  let chipX = x + 20;
  moodTags.slice(0, 3).forEach((tag) => {
    const label = `# ${tag}`;
    ctx.font = `400 16px ${RESULT_IMAGE_FONT}`;
    const chipWidth = Math.ceil(ctx.measureText(label).width) + 40;
    drawRoundRect(ctx, chipX, y + 76, chipWidth, 44, 20, "#f2f1ec");
    drawTextLines(ctx, [label], chipX + 20, y + 88, 20, {
      color: "#5c5950",
      size: 16,
      weight: 400,
    });
    chipX += chipWidth + 8;
  });
  y += 132;

  y += 54;
  if (pieceAsset.image) {
    ctx.drawImage(pieceAsset.image, x, y, 43, 48);
  }
  drawTextLines(ctx, ["오늘의 조각"], x + 59, y + 9, 30, {
    color: "#282723",
    size: 22,
    weight: 600,
  });

  y += 64;
  drawRoundRect(
    ctx,
    x,
    y,
    RESULT_IMAGE_CARD_WIDTH,
    pieceCardHeight,
    { tl: 0, tr: 26, br: 26, bl: 26 },
    "#fefefe",
  );
  drawTextLines(ctx, reasonLines, x + 20, y + 16, 26, {
    color: "#42403a",
    size: 16,
    weight: 400,
  });

  try {
    return await canvasToBlob(canvas);
  } finally {
    characterAsset.cleanup();
    shadowAsset.cleanup();
    pieceAsset.cleanup();
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const getUserId = () => {
  const stored = window.localStorage.getItem("userId");
  const id = Number(stored);
  return stored && id > 0 ? id : null;
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}.${month}.${date}`;
};

const LOADING_QUOTES = [
  "모든 게 낯설게 느껴지는 오늘, 앨리스도 처음엔 아무것도 이해하지 못한 채 그 세계에 뛰어들었어요.",
  "뿌듯함과 지침이 동시에 느껴지는 오늘, 어린 왕자처럼 작은 것들의 소중함을 알면서도 그 무게에 지쳐있는 당신과 닮았어요.",
  "내 단점이 자꾸 눈에 밟히는 오늘, 앤은 누구보다 자신의 다름을 사랑하는 법을 알고 있어요.",
  "책임과 현실이 무겁게 느껴지는 오늘, 피터팬은 어른이 되지 않아도 괜찮다고 말해줄 수 있는 유일한 캐릭터예요.",
  "내 직관을 무시하고 흔들렸거나, 누군가의 말에 경계를 잃은 날. 빨간 모자는 그 경험에서 가장 단단해지는 법을 알고 있어요.",
];

const getRandomLoadingQuoteIndex = (currentIndex = -1) => {
  if (LOADING_QUOTES.length <= 1) return 0;

  let nextIndex = Math.floor(Math.random() * LOADING_QUOTES.length);

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * LOADING_QUOTES.length);
  }

  return nextIndex;
};

const FALLBACK_ANALYSIS = {
  inputId: null,
  resultId: null,
  createdAt: "",
  character: {
    characterName: "어른이 된 어린왕자",
    bookQuote: "중요한 것은 눈에 보이지 않아. 마음으로 보아야 해",
    characterImgUrl: LITTLE_PRINCE_SRC,
    author: "앙투안 드 생텍쥐페리",
    methodReason:
      "뿌듯함과 지침이 동시에 느껴지는 오늘, 어린 왕자처럼 작은 것들의 소중함을 알면서도 그 무게에 지쳐있는 당신과 닮았어요.",
  },
};

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    prompt = "",
    emotions = ["공허함", "우울", "무기력"],
    comfort = "위로와 공감",
    loading: initialLoading = true,
    userName: stateUserName = "",
    analysis: initialAnalysis = null,
    returnTo = ROUTES.CHARACTER,
  } = location.state || {};

  const [loading, setLoading] = useState(initialAnalysis ? false : initialLoading);
  const [coinBanner, setCoinBanner] = useState(null);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [apiError, setApiError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [savingImage, setSavingImage] = useState(false);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(() =>
    getRandomLoadingQuoteIndex(),
  );

  const displayName = useMemo(() => {
    const savedNickname = window.localStorage.getItem("nickname") || "";
    return stateUserName || savedNickname || "김수현";
  }, [stateUserName]);

  const [coinCount, setCoinCount] = useState(() => {
    const savedCoinCount =
      window.localStorage.getItem("coinCount") ||
      window.localStorage.getItem("coins");

    const parsedCoinCount = Number.parseInt(savedCoinCount || "1", 10);
    return Number.isNaN(parsedCoinCount) ? 1 : parsedCoinCount;
  });

  useEffect(() => {
    if (!loading) return undefined;

    const userId = getUserId();

    if (prompt.trim() && userId) {
      let cancelled = false;

      createEmotionAnalysis({
        userId,
        inputText: prompt.trim(),
        emotionTag: emotions.join(","),
        comfortMethod: comfort,
      })
        .then((result) => {
          if (!cancelled) setAnalysis(result);
        })
        .catch((error) => {
          if (!cancelled) setApiError(error?.message ?? "감정 분석에 실패했습니다.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [comfort, emotions, loading, prompt]);

  useEffect(() => {
    if (!loading) return undefined;

    const timer = window.setInterval(() => {
      setLoadingQuoteIndex((currentIndex) => getRandomLoadingQuoteIndex(currentIndex));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [loading]);

  const moodTags = useMemo(() => {
    const normalized =
      emotions.length > 0 ? emotions : ["공허함", "우울", "무기력"];

    return normalized.slice(0, 3);
  }, [emotions]);

  const displayAnalysis = analysis ?? FALLBACK_ANALYSIS;
  const character = displayAnalysis.character ?? {};
  const characterName = character.characterName || FALLBACK_ANALYSIS.character.characterName;
  const bookQuote = character.bookQuote || FALLBACK_ANALYSIS.character.bookQuote;
  const characterImage = resolveRemoteAssetUrl(
    character.characterImgUrl,
    FALLBACK_ANALYSIS.character.characterImgUrl,
  );
  const characterAuthor =
    character.author || FALLBACK_ANALYSIS.character.author;
  const methodReason =
    character.methodReason ||
    displayAnalysis.methodReason ||
    FALLBACK_ANALYSIS.character.methodReason;
  const characterTheme = useMemo(
    () =>
      getResultCharacterTheme({
        characterKey:
          character.characterKey ||
          character.character_key ||
          character.characterType ||
          character.character_type ||
          character.slug ||
          character.type,
        characterName,
        characterAuthor,
        characterImage,
      }),
    [character, characterAuthor, characterImage, characterName],
  );

  useEffect(() => {
    if (!shareFeedback) return undefined;

    const timer = window.setTimeout(() => {
      setShareFeedback("");
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  const handleBack = () => {
    navigate(returnTo);
  };

  const handleRetry = () => {
    setCoinBanner("confirm");
  };

  const handleSaveImage = async () => {
    if (savingImage) return;

    setSavingImage(true);
    setShareFeedback("");

    try {
      const blob = await createResultImageBlob({
        displayName,
        characterName,
        characterAuthor,
        characterImage,
        bookQuote,
        moodTags,
        methodReason: apiError || methodReason,
        characterTheme,
      });

      downloadBlob(blob, createImageFileName(characterName));
      setShareFeedback("이미지가 저장됐어요.");
    } catch {
      setShareFeedback("이미지 저장에 실패했어요.");
    } finally {
      setSavingImage(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `NADOK - ${characterName}`;
    const text = [
      `${displayName}님의 정독 결과`,
      `${characterName} | ${characterAuthor}`,
      `“ ${bookQuote} ”`,
      methodReason,
    ]
      .filter(Boolean)
      .join("\n");
    const sharePayloads = [
      { title, text, url },
      { title, text },
    ];

    if (typeof navigator.share === "function") {
      for (const payload of sharePayloads) {
        try {
          if (typeof navigator.canShare === "function" && !navigator.canShare(payload)) {
            continue;
          }

          await navigator.share(payload);
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }

      setShareFeedback("공유할 수 없어요.");
      return;
    }

    if (window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches) {
      setShareFeedback("이 환경에서는 공유를 지원하지 않아요.");
      return;
    }

    try {
      await copyTextToClipboard(`${title}\n${text}\n${url}`);
      setShareFeedback("공유 내용이 복사됐어요.");
    } catch {
      setShareFeedback("공유할 수 없어요.");
    }
  };

  const handleCharacterImageError = (event) => {
    if (event.currentTarget.src.endsWith(LITTLE_PRINCE_SRC)) return;
    event.currentTarget.src = LITTLE_PRINCE_SRC;
  };

  const handleRegenerate = (event) => {
    event.stopPropagation();

    if (coinCount < REGENERATE_COIN_COST) {
      setCoinBanner("shortage");
      return;
    }

    const nextCoinCount = Math.max(coinCount - REGENERATE_COIN_COST, 0);
    setCoinCount(nextCoinCount);
    window.localStorage.setItem("coinCount", String(nextCoinCount));
    navigate(ROUTES.ANALYZE);
  };

  const handleBuyCoin = (event) => {
    event.stopPropagation();
    navigate(ROUTES.SHOP);
  };

  const loadingQuote = LOADING_QUOTES[loadingQuoteIndex] ?? LOADING_QUOTES[0];

  if (loading) {
    return (
      <main className="result-loading">
        <div className="result-loading__inner">
          <button
            className="result-loading__back-btn"
            type="button"
            onClick={handleBack}
          >
            ← 나가기
          </button>

          <p className="result-loading__date">{getCurrentDate()}</p>

          <h1 className="result-loading__title">
            오늘의 당신을
            <br />
            정독하고 있어요.......
          </h1>

          <div className="result-loading__visual" aria-hidden="true">
            <div className="result-loading__spinner-wrap">
              <Loading
                size={190}
                label="오늘의 당신을 정독하는 중"
                className="result-loading__spinner"
              />

              <img
                className="result-loading__character"
                src={LOAD_CHAR_SRC}
                alt=""
              />
            </div>
          </div>

          <p className="result-loading__quote">
            {loadingQuote}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="result">
      <div className="result__content">
        <header className="result__header">
          <button
            className="result__back"
            type="button"
            onClick={handleBack}
          >
            ← 나가기
          </button>

          <button
            className="result__share"
            type="button"
            aria-label="공유하기"
            onClick={handleShare}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 15V4"
                stroke="#42403A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8.5 7.5L12 4L15.5 7.5"
                stroke="#42403A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12.5V18.5C5 19.3284 5.67157 20 6.5 20H17.5C18.3284 20 19 19.3284 19 18.5V12.5"
                stroke="#42403A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {shareFeedback && (
          <p className="result__share-feedback" role="status">
            {shareFeedback}
          </p>
        )}

        <section className="result__intro">
          <h1>{displayName}님은...</h1>
          <p>{displayName}님의 상태를 정독한 결과에요.</p>
        </section>

        <section
          className="result__book-card"
          style={{ "--result-character-bg": characterTheme.cssBackground }}
        >
          <h2>{characterName}</h2>
          <p className="result__book-meta">저자 ㅣ {characterAuthor}</p>

          <div className="result__book-visual">
            <img
              className="result__book-shadow"
              src={PRINCE_SHADOW_SRC}
              alt=""
              aria-hidden="true"
            />

            <img
              className="result__book-image"
              src={characterImage}
              alt={characterName}
              onError={handleCharacterImageError}
            />
          </div>

          <div className="result__quote-box">
            <p>
              “ {bookQuote} ”
            </p>
          </div>
        </section>

        <section className="result__mood-card">
          <h2>{displayName}님의 기분 상태</h2>

          <div className="result__chips">
            {moodTags.map((tag) => (
              <span key={tag}># {tag}</span>
            ))}
          </div>
        </section>

        <section className="result__piece">
          <div className="result__piece-heading">
            <img src={RESULT_PIECE_CHAR_SRC} alt="" aria-hidden="true" />
            <h2>오늘의 조각</h2>
          </div>

          <div className="result__piece-card">
            <p>{apiError || methodReason}</p>
          </div>
        </section>

        <div className="result__actions">
          <button className="result__retry" type="button" onClick={handleRetry}>
            다시 생성하기
          </button>

          <button
            className="result__save"
            type="button"
            onClick={handleSaveImage}
            disabled={savingImage}
            aria-busy={savingImage}
          >
            {savingImage ? "저장 중..." : "이미지 저장하기"}
          </button>
        </div>
      </div>

      {coinBanner && (
        <div
          className="result-coin-banner"
          role="presentation"
          onClick={() => setCoinBanner(null)}
        >
          <section
            className="result-coin-banner__sheet"
            aria-label={
              coinBanner === "confirm" ? "다시 생성하기" : "코인이 부족해요"
            }
          >
            <img
              className="result-coin-banner__coin"
              src={COIN_SRC}
              alt=""
              aria-hidden="true"
            />

            <h2>
              {coinBanner === "confirm" ? "다시 생성하기" : "코인이 부족해요"}
            </h2>

            <p
              className={
                coinBanner === "shortage"
                  ? "result-coin-banner__desc result-coin-banner__desc--danger"
                  : "result-coin-banner__desc"
              }
            >
              {coinBanner === "confirm"
                ? `(다독 코인 ${REGENERATE_COIN_COST}개 필요)`
                : `(잔액 : ${coinCount}개 / 필요 갯수: ${REGENERATE_COIN_COST}개)`}
            </p>

            <div
              className={`result-coin-banner__actions${
                coinBanner === "shortage"
                  ? " result-coin-banner__actions--single"
                  : ""
              }`}
            >
              <button
                className={`result-coin-banner__button ${
                  coinBanner === "shortage"
                    ? "result-coin-banner__button--primary"
                    : "result-coin-banner__button--muted"
                }`}
                type="button"
                onClick={handleBuyCoin}
              >
                코인 구매하기
              </button>

              {coinBanner === "confirm" && (
                <button
                  className="result-coin-banner__button result-coin-banner__button--primary"
                  type="button"
                  onClick={handleRegenerate}
                >
                  네, 지불할게요!
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
