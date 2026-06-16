import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UserExternalPostsController } from '@/user/external-posts/user-external-posts.controller';
import { UserExternalPostsService } from '@/user/external-posts/user-external-posts.service';

type UserExternalPostsServiceMock = {
  [K in keyof UserExternalPostsService]: jest.Mock;
};

function createServiceMock(): UserExternalPostsServiceMock {
  return {
    findAll: jest.fn(),
  };
}

describe('UserExternalPostsController', () => {
  let app: INestApplication;
  let service: UserExternalPostsServiceMock;

  beforeEach(async () => {
    service = createServiceMock();

    const moduleRef = await Test.createTestingModule({
      controllers: [UserExternalPostsController],
      providers: [
        {
          provide: UserExternalPostsService,
          useValue: service,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /user/external-posts', () => {
    it('인증 정보 없이 공개 외부 글 목록을 요청하면 서비스 결과를 응답한다', async () => {
      // given: 공개 외부 글 목록 서비스가 한 건을 돌려주는 상태
      const items = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'External Title',
          url: 'https://medium.com/@bangdori/post',
          source: 'medium',
          category: 'tech',
          publishedAt: '2026-03-01T12:00:00.000Z',
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-02T00:00:00.000Z',
        },
      ];
      service.findAll.mockResolvedValue(items);

      // when: 인증 헤더나 쿠키 없이 공개 endpoint 를 호출한다
      const response = await request(app.getHttpServer()).get('/user/external-posts');

      // then: 공개 route 에서 서비스 결과를 그대로 JSON 으로 응답한다
      expect(response.status).toBe(200);
      expect(response.body).toEqual(items);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
