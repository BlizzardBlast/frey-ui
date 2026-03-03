import React from 'react';
import { createPortal } from 'react-dom';
import { ThemeContext } from '../ThemeProvider';

export type PortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | null;
};

function Portal({
  children,
  container
}: Readonly<PortalProps>): React.ReactPortal | null {
  const themeContext = React.useContext(ThemeContext);
  const [portalNode] = React.useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') {
      return null;
    }

    return document.createElement('div');
  });

  React.useEffect(() => {
    if (!portalNode || typeof document === 'undefined') {
      return;
    }

    const targetContainer = container ?? document.body;

    portalNode.dataset.freyPortal = 'true';
    targetContainer.appendChild(portalNode);

    return () => {
      portalNode.remove();
    };
  }, [container, portalNode]);

  React.useEffect(() => {
    if (!portalNode) {
      return;
    }

    portalNode.classList.add('frey-theme-provider');

    if (!themeContext) {
      delete portalNode.dataset.freyTheme;
      delete portalNode.dataset.freyHighContrast;
      return;
    }

    portalNode.dataset.freyTheme = themeContext.resolvedTheme;
    portalNode.dataset.freyHighContrast = String(themeContext.highContrast);
  }, [portalNode, themeContext]);

  if (!portalNode) {
    return null;
  }

  return createPortal(children, portalNode);
}

export default Portal;
