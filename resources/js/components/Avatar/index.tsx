import './avatar.scss';
export interface AvatarProps {
  className?: string;
  text?: string;
  image?: string;
}

export default function Avatar(props: AvatarProps) {
  if (!props.image) {
    return (
      <svg
        className={`avatar-component default-avatar ${props.className || ''}`}
        viewBox="0 0 24 24"
        fill="#007BFF"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="24" />
        <text
          x="12"
          y="16.5"
          textAnchor="middle"
          fontWeight="bold"
          fontSize="12"
          fontFamily="sans-serif"
        >
          {(props.text || '¿?').slice(0, 2).toUpperCase()}
        </text>
      </svg>
    );
  }

  return (
    <img 
      src={props.image} 
      className={`avatar-component image-avatar ${props.className || ''}`} 
    />
  );
}