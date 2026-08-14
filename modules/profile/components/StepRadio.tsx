"use client";

import { useEffect } from "react";
import Screen from "@/components/ui/screen";
import PageFooter from "@/components/ui/page-footer";
import CtaButton from "@/components/ui/cta-button";
import RadioOption from "@/components/ui/radio-option";
import StepHeader from "./StepHeader";
import type { StepProps } from "../types";

interface Props extends Omit<StepProps, "data" | "onChange"> {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function StepRadio({
  title,
  options,
  value,
  onChange,
  onNext,
  onBack,
  step,
}: Props) {
  useEffect(() => {
    // options는 스텝마다 다른 모듈 상수 배열이라, 참조가 바뀔 때(=스텝 전환 시)마다 다시 체크된다.
    // 같은 컴포넌트 인스턴스가 5~9단계에 걸쳐 재사용되므로 마운트 시 1회만 실행되는 []는 이후 스텝에서 동작하지 않는다.
    if (!value && options.length > 0) onChange(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-5 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
          {title}
        </h1>
        <div className="flex flex-col gap-[10px]">
          {options.map((opt) => (
            <RadioOption
              key={opt}
              label={opt}
              selected={value === opt}
              onClick={() => onChange(opt)}
            />
          ))}
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!value} onClick={onNext}>
          다음
        </CtaButton>
      </PageFooter>
    </Screen>
  );
}
