const isProd = process.env.NODE_ENV === 'production';

function format(...args: any[]) {
  return args
    .map(a =>
      a instanceof Error
        ? a.stack || a.message
        : typeof a === 'object'
          ? JSON.stringify(a)
          : String(a),
    )
    .join(' ');
}

export const logger = {
  info: (...args: any[]) => {
    if (!isProd) console.info('[info]', format(...args));
  },
  warn: (...args: any[]) => {
    if (!isProd) console.warn('[warn]', format(...args));
  },
  error: (...args: any[]) => {
    console.error('[error]', format(...args));
  },
};

export default logger;
