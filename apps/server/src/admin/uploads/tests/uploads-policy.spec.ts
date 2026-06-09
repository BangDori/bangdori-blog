import { buildUploadObjectKey } from '@admin/uploads/uploads-policy';

describe('uploads policy', () => {
  describe('buildUploadObjectKey', () => {
    it('연·월 prefix 와 uuid, 슬러그된 파일명, contentType 기반 확장자를 결합해 키를 만든다', () => {
      // given: 2026년 3월 어느 시점, 한글 파일명, png contentType
      const now = new Date(Date.UTC(2026, 2, 7, 10, 0, 0));

      // when: 영문 슬러그가 안전하게 생성되는 키 생성 호출
      const key = buildUploadObjectKey({
        originalFilename: '안녕하세요-Hello World.png',
        contentType: 'image/png',
        now,
      });

      // then: 키는 posts/2026/03/<uuid>-<slug>.png 형태
      expect(key).toMatch(
        /^posts\/2026\/03\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-hello-world\.png$/,
      );
    });

    it('image/jpeg 면 .jpg 확장자를 사용한다', () => {
      // given: 2026년 1월
      const now = new Date(Date.UTC(2026, 0, 1));

      // when: jpeg contentType 으로 키 생성
      const key = buildUploadObjectKey({
        originalFilename: 'photo.jpeg',
        contentType: 'image/jpeg',
        now,
      });

      // then: 확장자는 jpg
      expect(key).toMatch(/\.jpg$/);
      expect(key).toMatch(/^posts\/2026\/01\//);
    });

    it('파일명이 특수문자뿐이어도 안전한 fallback 슬러그로 키를 만든다', () => {
      // given: 슬러그화하면 비는 파일명
      const now = new Date(Date.UTC(2026, 5, 1));

      // when: 키 생성
      const key = buildUploadObjectKey({
        originalFilename: '!!!.png',
        contentType: 'image/png',
        now,
      });

      // then: 빈 슬러그 대신 'file' 이 사용됨
      expect(key).toMatch(/-file\.png$/);
    });

    it('같은 파일명을 두 번 호출해도 매번 새 키가 만들어진다', () => {
      // given: 동일 입력
      const input = {
        originalFilename: 'same.png',
        contentType: 'image/png' as const,
        now: new Date(Date.UTC(2026, 0, 1)),
      };

      // when: 두 번 호출
      const a = buildUploadObjectKey(input);
      const b = buildUploadObjectKey(input);

      // then: uuid 가 매번 새로 생성되어 키가 다르다
      expect(a).not.toBe(b);
    });

    it('월은 두 자리로 zero padding 된다', () => {
      // given: 1월 (단일 자리)
      const now = new Date(Date.UTC(2026, 0, 15));

      // when: 키 생성
      const key = buildUploadObjectKey({
        originalFilename: 'a.png',
        contentType: 'image/png',
        now,
      });

      // then: 01 형태
      expect(key.startsWith('posts/2026/01/')).toBe(true);
    });

    it('슬러그는 60자로 제한된다', () => {
      // given: 60자가 넘는 영문 파일명
      const longName = 'a'.repeat(80);
      const now = new Date(Date.UTC(2026, 0, 1));

      // when: 키 생성
      const key = buildUploadObjectKey({
        originalFilename: `${longName}.png`,
        contentType: 'image/png',
        now,
      });

      // then: 슬러그 부분이 60자 이하
      const slug = key.replace(/^posts\/\d{4}\/\d{2}\/[0-9a-f-]{36}-/, '').replace(/\.png$/, '');
      expect(slug.length).toBeLessThanOrEqual(60);
    });
  });
});
