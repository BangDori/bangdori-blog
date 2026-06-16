import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule } from '@/app.module';
import { UserExternalPostsModule } from '@/user/external-posts/user-external-posts.module';

describe('AppModule', () => {
  it('공개 외부 글 모듈을 앱에 연결한다', () => {
    // given: 앱 모듈 정의

    // when: 앱 모듈의 연결 목록을 확인
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) as unknown[];

    // then: 공개 외부 글 모듈이 포함된다
    expect(imports).toContain(UserExternalPostsModule);
  });
});
