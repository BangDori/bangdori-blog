'use client';

export default function Error() {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const prev = document.referrer;
      const isInternal = prev && prev.startsWith(window.location.origin);

      if (isInternal) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-var(--header-height)*3)] w-full flex-1 flex-col items-center justify-center bg-white px-4">
      <h1 className="mb-4 text-3xl font-bold">404 Error</h1>
      <p className="text-center text-sm text-gray-700">
        요청하신 페이지를 찾을 수 없습니다.
        <br />
        입력하신 주소가 정확한지 다시 한번 확인해주세요.
      </p>
      <button
        type="button"
        onClick={handleBack}
        className="mt-3 cursor-pointer text-blue-500 hover:underline"
      >
        이전 페이지로 이동하기
      </button>
    </section>
  );
}
