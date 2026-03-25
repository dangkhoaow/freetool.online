import React from 'react';

type ScriptProps = React.ScriptHTMLAttributes<HTMLScriptElement> & {
  strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload' | 'worker';
};

export default function Script({ children, ...props }: ScriptProps) {
  const scriptContent =
    typeof children === 'string'
      ? children
      : Array.isArray(children)
        ? children.join('')
        : '';

  return <script {...props} dangerouslySetInnerHTML={scriptContent ? { __html: scriptContent } : undefined} />;
}
