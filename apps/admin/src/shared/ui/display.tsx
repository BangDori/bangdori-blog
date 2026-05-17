import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface DisplayProps {
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  children: ReactNode;
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
const HIDE_CLASS: Record<string, string> = {
  '': 'hidden',
  mobile: 'md:hidden',
  tablet: 'max-md:hidden lg:hidden',
  desktop: 'max-lg:hidden',
  'mobile,tablet': 'lg:hidden',
  'tablet,desktop': 'max-md:hidden',
  'mobile,desktop': 'md:max-lg:hidden',
  'mobile,tablet,desktop': '',
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
