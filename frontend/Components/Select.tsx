interface SelectProps {
    label: string;
    options: string[];
}

function Select({ label, options }: SelectProps) {
    return (
        <div className="border border-borderInput bg-branco rounded-lg p-2">
            <label>{label}</label>

            <select className="outline-none">
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

export default Select;