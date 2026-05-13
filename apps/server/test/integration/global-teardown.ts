/**
 * 통합 테스트 종료 후 한 번 실행.
 * 현재는 별도 정리할 자원이 없으므로 no-op.
 * (각 테스트는 자체 DataSource를 닫고, DB는 외부에서 관리된다.)
 */
export default async function globalTeardown(): Promise<void> {}
