interface IconProps {
  className?: string;
  title?: string;
}

function defaultProps(props: IconProps) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: props.className ?? 'size-6',
    'aria-hidden': !props.title as boolean,
  };
}

export function Gem(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M11 3l1 10" />
      <path d="M2 9h20" />
      <path d="M7 3l-5 6 10 13" />
      <path d="M17 3l5 6-10 13" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7z" />
    </svg>
  );
}

export function Flame(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

export function Eye(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function Wallet(props: IconProps) {
  return (
    <svg {...defaultProps(props)}>
      {props.title && <title>{props.title}</title>}
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}
