import React, { ComponentType, Suspense } from 'react';

type DynamicLoader<TProps> = () => Promise<{ default: ComponentType<TProps> } | ComponentType<TProps>>;

type DynamicOptions<TProps> = {
  loading?: ComponentType<any>;
  ssr?: boolean;
  suspense?: boolean;
};

function toComponentModule<TProps>(
  loaded: { default?: ComponentType<TProps> } | ComponentType<TProps>,
): { default: ComponentType<TProps> } {
  if (typeof loaded === 'function') {
    return { default: loaded as ComponentType<TProps> };
  }

  if (loaded && typeof loaded === 'object' && 'default' in loaded && loaded.default) {
    return { default: loaded.default as ComponentType<TProps> };
  }

  throw new Error('next/dynamic loader must resolve to a React component');
}

export default function dynamic<TProps = Record<string, unknown>>(
  loader: DynamicLoader<TProps>,
  options: DynamicOptions<TProps> = {},
): ComponentType<TProps> {
  const LazyComponent = React.lazy(async () => {
    const loaded = await loader();
    return toComponentModule<TProps>(loaded);
  });

  const LoadingComponent = options.loading;

  const DynamicComponent: React.FC<TProps> = (props: TProps) => {
    const fallback = LoadingComponent ? <LoadingComponent /> : null;

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  DynamicComponent.displayName = 'DynamicComponent';

  return DynamicComponent;
}
