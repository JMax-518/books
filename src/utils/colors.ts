export const uicolors = {
  black: '#1E293B',
  gray: {
    25: '#fcfcfd',
    50: '#f8f9fc',
    100: '#f2f4f8',
    200: '#ebeff5',
    300: '#e2e8f0',
    400: '#cad5e2',
    500: '#9aa8bc',
    600: '#8493a9',
    700: '#64748b',
    800: '#475569',
    900: '#334155',
  },
  red: {
    100: '#fff5f5',
    200: '#fed7d7',
    300: '#feb2b2',
    400: '#fc8181',
    500: '#f56565',
    600: '#e53e3e',
    700: '#c53030',
    800: '#9b2c2c',
    900: '#742a2a',
  },
  orange: {
    100: '#fffaf0',
    200: '#feebc8',
    300: '#fbd38d',
    400: '#f6ad55',
    500: '#ed8936',
    600: '#dd6b20',
    700: '#c05621',
    800: '#9c4221',
    900: '#7b341e',
  },
  yellow: {
    100: '#fffff0',
    200: '#fefcbf',
    300: '#faf089',
    400: '#f6e05e',
    500: '#ecc94b',
    600: '#d69e2e',
    700: '#b7791f',
    800: '#975a16',
    900: '#744210',
  },
  green: {
    100: '#f0fff4',
    200: '#c6f6d5',
    300: '#9ae6b4',
    400: '#68d391',
    500: '#48bb78',
    600: '#38a169',
    700: '#2f855a',
    800: '#276749',
    900: '#22543d',
  },
  teal: {
    100: '#e6fffa',
    200: '#b2f5ea',
    300: '#81e6d9',
    400: '#4fd1c5',
    500: '#38b2ac',
    600: '#319795',
    700: '#2c7a7b',
    800: '#285e61',
    900: '#234e52',
  },
  blue: {
    100: '#e5f3ff',
    200: '#cce7ff',
    300: '#99d0ff',
    400: '#66b8ff',
    500: '#33a1ff',
    600: '#2490ef',
    700: '#006ecc',
    800: '#005299',
    900: '#003766',
  },
  indigo: {
    100: '#ebf4ff',
    200: '#c3dafe',
    300: '#a3bffa',
    400: '#7f9cf5',
    500: '#667eea',
    600: '#5a67d8',
    700: '#4c51bf',
    800: '#434190',
    900: '#3c366b',
  },
  purple: {
    100: '#faf5ff',
    200: '#e9d8fd',
    300: '#d6bcfa',
    400: '#b794f4',
    500: '#9f7aea',
    600: '#805ad5',
    700: '#6b46c1',
    800: '#553c9a',
    900: '#44337a',
  },
  pink: {
    100: '#fdf7f8',
    200: '#fbeef1',
    300: '#f7dee5',
    400: '#eec3d2',
    500: '#df9eb8',
    600: '#cf82a7',
    700: '#ac688b',
    800: '#8f5b79',
    900: '#70485f',
  },
};

export const indicators = {
  GRAY: 'grey',
  GREY: 'grey',
  BLUE: 'blue',
  RED: 'red',
  GREEN: 'green',
  ORANGE: 'orange',
  PURPLE: 'purple',
  YELLOW: 'yellow',
  BLACK: 'black',
};

const getValidColor = (color: string) => {
  const isValid = [
    'gray',
    'orange',
    'green',
    'red',
    'yellow',
    'blue',
    'indigo',
    'pink',
    'purple',
    'teal',
  ].includes(color);
  return isValid ? color : 'gray';
};

export function getBgColorClass(color: string) {
  const vcolor = getValidColor(color);
  return `bg-${vcolor}-200`;
}

export function getColorClass(color: string, type: 'bg' | 'text', value = 300) {
  return `${type}-${getValidColor(color)}-${value}`;
}

export function getTextColorClass(color: string) {
  return `text-${getValidColor(color)}-700`;
}

export function getBgTextColorClass(color: string) {
  const bg = getBgColorClass(color);
  const text = getTextColorClass(color);
  return [bg, text].join(' ');
}
