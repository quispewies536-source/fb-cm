"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAppStrings } from "@/hooks/useAppStrings";

interface ModalProps {
    isOpen?: boolean;
    title?: string;
    children?: React.ReactNode;
    onClose?: () => void;
    isClosable?: boolean | false;
    heightFull?: boolean | false;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose, isClosable = true, heightFull }) => {
    const t = useAppStrings();
    const showHeaderRow = Boolean(title) || isClosable;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-backdrop"
                    className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:py-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        key="modal-content"
                        className={`bg-[linear-gradient(130deg,_rgba(249,241,249,1)_0%,_rgba(234,243,253,1)_35%,_rgba(237,251,242,1)_100%)] mx-auto flex w-full min-w-0 max-w-lg max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] flex-col overflow-hidden rounded-[16px] shadow-lg px-[18px] py-[18px] sm:max-h-[min(92dvh,calc(100dvh-5rem))] sm:px-[20px] sm:py-[20px] ${heightFull ? 'h-full max-h-none' : ''}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {showHeaderRow ? (
                            <div className="mb-[10px] flex items-center justify-between gap-2">
                                {title ? (
                                    <h2 className="min-w-0 flex-1 text-left text-[14px] font-bold leading-snug text-[#0A1317] break-words sm:text-[15px]">
                                        {title}
                                    </h2>
                                ) : (
                                    <div className="min-w-0 flex-1" />
                                )}

                                {isClosable ? (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label={t.common.close}
                                        className="flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-60 transition-opacity duration-200 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2]"
                                    >
                                        <img src="/images/icons/ic_close.svg" className="h-[18px] w-[18px] pointer-events-none" alt="" aria-hidden />
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="flex-1 overflow-y-auto">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
