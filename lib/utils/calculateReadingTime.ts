const READING_SPEED = {
  CJK_CHARACTERS_PER_MINUTE: 500,
  LATIN_WORDS_PER_MINUTE: 265,
} as const;

const CJK_CHARACTER_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g;
const LATIN_WORD_PATTERN = /[A-Za-z0-9]+(?:['’_-][A-Za-z0-9]+)*/g;
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\([^)]*\)/g;
const HTML_IMAGE_PATTERN = /<img\b[^>]*>/gi;

function countImages(markdown: string) {
  return (
    (markdown.match(MARKDOWN_IMAGE_PATTERN)?.length ?? 0) +
    (markdown.match(HTML_IMAGE_PATTERN)?.length ?? 0)
  );
}

function getImageReadingSeconds(imageCount: number) {
  return Array.from({ length: imageCount }, (_, index) => Math.max(12 - index, 3)).reduce(
    (total, seconds) => total + seconds,
    0
  );
}

function getReadableText(markdown: string) {
  return markdown
    .replace(MARKDOWN_IMAGE_PATTERN, ' ')
    .replace(HTML_IMAGE_PATTERN, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[`*_~>#|()[\]-]/g, ' ');
}

/**
 * Medium의 언어별 읽기 속도와 이미지 가중치를 기준으로 예상 읽기 시간을 계산합니다.
 */
export function calculateReadingTime(markdown: string) {
  const text = getReadableText(markdown);
  const cjkCharacterCount = text.match(CJK_CHARACTER_PATTERN)?.length ?? 0;
  const latinWordCount =
    text.replace(CJK_CHARACTER_PATTERN, ' ').match(LATIN_WORD_PATTERN)?.length ?? 0;
  const textMinutes =
    cjkCharacterCount / READING_SPEED.CJK_CHARACTERS_PER_MINUTE +
    latinWordCount / READING_SPEED.LATIN_WORDS_PER_MINUTE;
  const imageMinutes = getImageReadingSeconds(countImages(markdown)) / 60;

  return Math.max(1, Math.ceil(textMinutes + imageMinutes));
}
