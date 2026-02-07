import { ClipboardCheck, Copy } from 'lucide-react';
import { useState } from 'react';

const CopyTextComponent = ({ textToCopy }: { textToCopy: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span>{textToCopy}</span>
            <button onClick={copyToClipboard} className="cursor-pointer">
                {isCopied ? <ClipboardCheck size={12} /> : <Copy size={12} />}
            </button>
        </div>
    );
};

export default CopyTextComponent;
