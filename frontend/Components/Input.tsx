interface inputProps {
    type?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

function Input ({type, onChange, placeholder }: inputProps) {
    return (
        <input className="bg-transparent h-10 border outline-none border-borderInput rounded-lg pl-2 autofill:bg-transparent autofill:shadow-[inset_0_0_0_1000px_white] w-[100%]" type={type} onChange={onChange} placeholder={placeholder} />
    )
}

export default Input