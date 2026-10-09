const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",

    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200",

    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",

    outline:
      "border border-green-600 text-green-600 bg-white hover:bg-green-50",

    ghost:
      "text-gray-700 bg-transparent hover:bg-gray-100",

    dark:
      "bg-[#17211b] text-white hover:bg-[#243229]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${
        variants[variant] || variants.primary
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;