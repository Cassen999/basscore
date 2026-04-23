import { Tooltip } from 'primereact/tooltip';
import type { ComponentProps } from 'react';
import { useState, useEffect } from 'react';

const BCTooltip = (props: ComponentProps<typeof Tooltip>) => {
  const [isMd, setIsMd] = useState<boolean>(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isMd) return null;
  return <Tooltip {...props} />;
};

export default BCTooltip;
