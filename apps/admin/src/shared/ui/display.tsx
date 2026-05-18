import { Children, cloneElement, isValidElement, type ReactElement } from 'react';
import { cn } from '@shared/lib/cn';

// className 을 받을 수 있는 element 만 허용. Fragment/string/number 는 컴파일 타임에 차단.
// {cond && <X />} 패턴 호환을 위해 false/null/undefined 도 허용.
type DisplayChild = ReactElement<{ className?: string }> | false | null | undefined;

interface DisplayProps {
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  children: DisplayChild | DisplayChild[];
}

/**
 * breakpoint 정의 (tailwind 기본):
 *  - mobile  : < md   (< 768px)
 *  - tablet  : md ~ lg (768 ~ 1023px)
 *  - desktop : >= lg  (>= 1024px)
 *
 * 자체 wrapper 를 만들지 않고 children element 의 className 에 visibility 클래스를
 * 머지한다 (cloneElement). element 의 원래 display(flex/grid/inline)는 그대로
 * 유지하고 "어디서 숨길지" 만 적용한다.
 */
// key 는 [mobile?, tablet?, desktop?].sort().join(',') 로 만들어진다.
// 알파벳 순(d < m < t)이라 'desktop,tablet' 같이 정렬된 형태가 와야 lookup 된다.
const HIDE_CLASS: Record<string, string> = {
  '': 'hidden',
  mobile: 'md:hidden',
  tablet: 'max-md:hidden lg:hidden',
  desktop: 'max-lg:hidden',
  'mobile,tablet': 'lg:hidden',
  'desktop,tablet': 'max-md:hidden',
  'desktop,mobile': 'md:max-lg:hidden',
  'desktop,mobile,tablet': '',
};

export function Display({ mobile, tablet, desktop, children }: DisplayProps) {
  const key = [mobile && 'mobile', tablet && 'tablet', desktop && 'desktop']
    .filter(Boolean)
    .sort()
    .join(',');
  const hideClass = HIDE_CLASS[key] ?? 'hidden';

  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement<{ className?: string }>(child)) return child;
        return cloneElement(child, {
          className: cn(hideClass, child.props.className),
        });
      })}
    </>
  );
}
