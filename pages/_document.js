// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { extractCritical } from '@emotion/server';
import React from 'react';

// Create an Emotion cache
const cache = createCache({ key: 'css', prepend: true });

export default class MyDocument extends Document {
  render() {
    const { css, ids } = this.props;

    return (
      <Html>
        <Head>
          {/* Include any other tags you want here */}
          <style
            data-emotion-css={Array.isArray(ids) ? ids.join(' ') : ''}
            dangerouslySetInnerHTML={{ __html: css || '' }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;

  // Render page and collect styles
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) =>
        (
          <CacheProvider value={cache}>
            <App {...props} />
          </CacheProvider>
        ),
    });

  const initialProps = await Document.getInitialProps(ctx);

  // Extract critical CSS
  const page = ctx.renderPage();
  const { css, ids } = extractCritical(page.html);

  return {
    ...initialProps,
    css,
    ids,
  };
};
