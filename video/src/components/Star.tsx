import { colors } from "../theme";

export const Star: React.FC<{
  size: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ size, color = colors.accent, style }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={color}
        stroke="#e6b800"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </svg>
  );
};
