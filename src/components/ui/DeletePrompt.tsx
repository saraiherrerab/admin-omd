import { Button } from "./Button";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const DeletePrompt = ({
    title,
    message,
    onConfirm,
    onCancel
}: {
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center text-center gap-6 p-2">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={32} />
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <p className="text-muted-foreground">{message}</p>
            </div>

            <div className="flex w-full gap-3 mt-2">
                <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={onCancel}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={onConfirm}
                >
                    {t('common.delete')}
                </Button>
            </div>
        </div>
    );
};