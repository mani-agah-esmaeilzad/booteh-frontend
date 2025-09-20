// src/components/modals/ResultsModal.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Award, LoaderCircle, AlertTriangle } from "lucide-react";
import apiFetch from "@/services/apiService";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AssessmentResult {
    assessment: {
        score: number;
        max_score: number;
        description: string;
    };
}

interface ResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessmentId: number | null;
}

const ResultsModal = ({ isOpen, onClose, assessmentId }: ResultsModalProps) => {
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && assessmentId) {
            const fetchResults = async () => {
                setIsLoading(true);
                setError(null);
                setResult(null);
                try {
                    const response = await apiFetch(`assessment/results/${assessmentId}`);
                    if (response.success && response.data) {
                        setResult(response.data);
                    } else {
                        throw new Error(response.message || 'نتایج ارزیابی یافت نشد.');
                    }
                } catch (err: any) {
                    setError(err.message);
                    toast.error(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResults();
        }
    }, [isOpen, assessmentId]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10">
                    <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-hrbooteh-primary" />
                    <p className="mt-4 text-hrbooteh-text-secondary">در حال آماده‌سازی گزارش نهایی...</p>
                </div>
            );
        }

        if (error || !result) {
            return (
                <div className="text-center p-10 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <p className="mt-4 text-destructive font-semibold">خطا در دریافت گزارش</p>
                    <p className="text-hrbooteh-text-secondary mt-2">{error || "نتیجه‌ای برای نمایش یافت نشد."}</p>
                </div>
            );
        }

        const { score, max_score, description } = result.assessment;

        return (
            <>
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-hrbooteh-gradient-primary rounded-full flex items-center justify-center">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold text-hrbooteh-text-primary">
                        گزارش نهایی ارزیابی
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-hrbooteh-text-secondary pt-2">
                        تبریک! شما این مرحله از ارزیابی را با موفقیت تکمیل کرده‌اید.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <p className="text-hrbooteh-text-primary font-bold text-4xl">{score} <span className="text-lg font-medium text-hrbooteh-text-secondary">/ {max_score}</span></p>
                        <p className="text-sm text-hrbooteh-text-muted">نمره کل</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-semibold text-hrbooteh-text-primary">مشاهده تحلیل کامل</AccordionTrigger>
                            <AccordionContent>
                                <div className="prose prose-sm max-w-none text-hrbooteh-text-secondary leading-relaxed pt-2">
                                    <ReactMarkdown>{description}</ReactMarkdown>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                {renderContent()}
                <DialogFooter className="mt-4">
                    <Button onClick={onClose} variant="hrbooteh" className="w-full">
                        بازگشت به داشبورد
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResultsModal;