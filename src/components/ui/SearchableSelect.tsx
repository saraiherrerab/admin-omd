import { type ComponentProps, forwardRef, useState, useEffect } from "react";
import { Button } from "./Button";
import { Loader2, X } from "lucide-react"; // Added a loader icon
import { Input } from "./Input";

interface AsyncSelectProps extends Omit<ComponentProps<"div">, 'onChange'> {
    options: { value: any; label: string }[];
    label: string;
    value?: any;
    onChange: (value: any) => void;
    onSearchChange: (query: string) => void; // Prop to trigger API call
    isLoading?: boolean; // Show loading state
}

export const SearchableSelect = forwardRef<HTMLDivElement, AsyncSelectProps>(
    ({ options, label, onChange, onSearchChange, isLoading }) => {
        const [search, setSearch] = useState("");
        const [selectedOption, setSelectedOption] = useState(null);

        // Debounce logic: wait 300ms after user stops typing to call the API
        useEffect(() => {
            const handler = setTimeout(() => {
                onSearchChange(search);
            }, 300);

            return () => clearTimeout(handler);
        }, [search, onSearchChange]);

        // const selectedOption = options.find((opt) => opt.value === value);

        const handleSelect = (val: any) => {
            //  console.log(val);
            onChange(val.value);
            setSearch(val.label);
            setSelectedOption(val.label);
            // setOpen(false);
        };



        return (
            <div className="w-full">
                <div className="flex flex-row gap-2">
                    <Input
                        placeholder={label}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}

                        className="w-full"
                    />
                    <Button variant="ghost" className="w-12 h-full" onClick={() => { setSearch(""); setSelectedOption(null); }}>
                        <X />
                    </Button>
                </div>
                {search.length > 0 && selectedOption === null && (
                    <ul className="max-h-60 overflow-y-auto p-1 w-full bg-white">
                        {isLoading ? (
                            <li className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted" /></li>
                        ) : options.length > 0 ? (
                            options.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className="cursor-pointer rounded-sm px-2 py-2 text-sm hover:bg-neutral-tertiary-medium"
                                >
                                    {option.label}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-sm text-center text-muted-foreground">not found</li>
                        )}
                    </ul>
                )}
            </div>


        );
    }
);