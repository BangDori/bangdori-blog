import { Test } from '@nestjs/testing';
import { UploadsService } from '@admin/uploads/uploads.service';
import { R2Service } from '@/storage/r2/r2.service';

type R2ServiceMock = {
  createPresignedPut: jest.Mock;
  buildPublicUrl: jest.Mock;
};

function createR2ServiceMock(): R2ServiceMock {
  return {
    createPresignedPut: jest.fn(),
    buildPublicUrl: jest.fn((key: string) => `https://cdn.bangdori.kr/${key}`),
  };
}

describe('UploadsService', () => {
  let service: UploadsService;
  let r2: R2ServiceMock;

  beforeEach(async () => {
    r2 = createR2ServiceMock();
    const moduleRef = await Test.createTestingModule({
      providers: [UploadsService, { provide: R2Service, useValue: r2 }],
    }).compile();
    service = moduleRef.get(UploadsService);
  });

  it('업로드 위치 정보와 공개 주소, 만료 시간을 한 번에 묶어 돌려준다', async () => {
    // given: R2 가 약속된 uploadUrl 을 만들어준다
    r2.createPresignedPut.mockResolvedValue('https://acct.r2.cloudflarestorage.com/upload?sig=x');

    // when: presign 호출
    const result = await service.presign({
      contentType: 'image/png',
      originalFilename: 'foo.png',
    });

    // then: 응답 contract 를 구성하고 같은 key 로 uploadUrl/publicUrl 을 만든다
    expect(result).toEqual({
      key: expect.stringMatching(/^posts\/\d{4}\/\d{2}\/[0-9a-f-]{36}-foo\.png$/),
      uploadUrl: 'https://acct.r2.cloudflarestorage.com/upload?sig=x',
      publicUrl: expect.stringMatching(/^https:\/\/cdn\.bangdori\.kr\/posts\/\d{4}\/\d{2}\//),
      expiresInSec: 300,
    });
    expect(r2.createPresignedPut).toHaveBeenCalledWith({
      key: result.key,
      contentType: 'image/png',
      expiresInSec: 300,
    });
    expect(r2.buildPublicUrl).toHaveBeenCalledWith(result.key);
  });
});
