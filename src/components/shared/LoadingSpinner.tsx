interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4 border",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-2",
};

const LoadingSpinner = ({ size = "md", className = "" }: Props) => (
  <div className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`} />
);

export const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="md" />
  </div>
);

export default LoadingSpinner;
