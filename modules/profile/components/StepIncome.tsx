"use client";

import { useEffect } from "react";
import Screen from "@/components/ui/screen";
import PageFooter from "@/components/ui/page-footer";
import CtaButton from "@/components/ui/cta-button";
import RadioOption from "@/components/ui/radio-option";
import StepHeader from "./StepHeader";
import { INCOME_OPTIONS } from "../constants";
import type { StepProps } from "../types";

export default function StepIncome({
  data,
  onChange,
  onNext,
  onBack,
  step,
}: StepProps) {
  useEffect(() => {
    if (!data.income) onChange({ income: INCOME_OPTIONS[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-5 flex flex-col gap-5 scroll-area overflow-y-auto pb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f0f10] leading-[1.35]">
            연봉을 알려주세요.
          </h1>
          <p className="mt-1 text-[13px] text-[#e53935]">
            연봉 정보는 프로필에 공개되지 않아요.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-[8px]">
          {INCOME_OPTIONS.slice(0, 8).map((opt) => (
            <RadioOption
              key={opt}
              label={opt}
              selected={data.income === opt}
              onClick={() => onChange({ income: opt })}
            />
          ))}
          <RadioOption
            label={INCOME_OPTIONS[8]}
            selected={data.income === INCOME_OPTIONS[8]}
            onClick={() => onChange({ income: INCOME_OPTIONS[8] })}
          />
        </div>
      </div>
      <PageFooter>
        <CtaButton disabled={!data.income} onClick={onNext}>
          다음
        </CtaButton>
      </PageFooter>
    </Screen>
  );
}
