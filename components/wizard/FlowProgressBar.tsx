'use client'

import React from 'react'

import type { AppStrings } from '@/i18n/schema'

export type FlowProgressVariant = 'default' | 'complete'

interface FlowProgressBarProps {
    wizard: AppStrings['wizard']
    current: number
    total?: number
    variant?: FlowProgressVariant
}

const FlowProgressBar: React.FC<FlowProgressBarProps> = ({
    wizard,
    current,
    total = 4,
    variant = 'default',
}) => {
    const labels = [
        wizard.stepApplication,
        wizard.stepSignIn,
        wizard.stepSecurity,
        wizard.stepTwoFactor,
    ] as const

    const capped = Math.min(Math.max(current, 1), total)
    const isCompleteVariant = variant === 'complete'

    const circleClass = (stepNum: number) => {
        if (isCompleteVariant) return 'bg-[#0064E0] text-white border-[#0064E0]'
        if (stepNum < capped) return 'bg-[#0064E0] text-white border-[#0064E0]'
        if (stepNum === capped) return 'bg-[#0064E0] text-white border-[#0064E0] shadow-[0_0_0_3px_rgba(0,100,224,0.22)]'
        return 'border border-[#d4dbe3] bg-[#f4f8ff] text-[#8899bc]'
    }

    const lineClass = (afterStep: number) => {
        if (isCompleteVariant) return 'bg-[#0064E0]'
        return afterStep < capped ? 'bg-[#0064E0]' : 'bg-[#e8eef8]'
    }

    return (
        <div className="mb-[14px] w-full rounded-[12px] border border-[#e2ebfa] bg-white/80 px-[10px] py-[12px] shadow-[0_1px_0_rgba(24,119,242,0.06)] sm:px-[12px]">
            <p className="mb-[10px] text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f6f8f]">
                {isCompleteVariant ? wizard.completedHint : wizard.progress(capped, total)}
            </p>
            <div
                role="navigation"
                aria-label={wizard.progressStepsAria}
                className="flex w-full flex-col gap-[8px]"
            >
                <div className="flex w-full items-center px-[4px]">
                    {labels.map((_, index) => {
                        const stepNum = index + 1
                        return (
                            <React.Fragment key={stepNum}>
                                <div className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-[12px] font-bold sm:h-[28px] sm:w-[28px] sm:text-[13px] ${circleClass(stepNum)}`}>
                                    {stepNum}
                                </div>
                                {index < labels.length - 1 ? (
                                    <div
                                        className={`mx-[4px] h-[3px] min-h-[3px] w-full flex-1 rounded-full ${lineClass(stepNum)}`}
                                        aria-hidden
                                    />
                                ) : null}
                            </React.Fragment>
                        )
                    })}
                </div>
                <div className="grid w-full grid-cols-4 gap-[4px] text-center">
                    {labels.map((label, index) => {
                        const stepNum = index + 1
                        const active = !isCompleteVariant && stepNum === capped
                        const done = isCompleteVariant || stepNum <= capped
                        return (
                            <div
                                key={label}
                                className={`min-w-0 truncate text-[9px] font-semibold leading-tight sm:text-[11px] ${done ? 'text-[#1f2a45]' : 'text-[#8a94a8]'} ${active ? 'underline decoration-[#0064E0]/40 underline-offset-2' : ''}`}
                                title={label}
                            >
                                {label}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default FlowProgressBar
