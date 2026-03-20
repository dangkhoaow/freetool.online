type FontOptions = {
  variable?: string;
};

function createFont(options: FontOptions = {}) {
  return {
    className: '',
    variable: options.variable || '',
  };
}

export function Inter(options?: FontOptions) {
  return createFont(options);
}

export function DM_Sans(options?: FontOptions) {
  return createFont(options);
}
