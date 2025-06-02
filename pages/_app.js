import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>IT & Tech Leadership Interviews Landed by Wolf Mentoring Clients</title>
        <meta name="title" content="IT & Tech Leadership Interviews Landed by Wolf Mentoring Clients" />
        <meta name="description" content="Full list of Interviews landed for our clients through our Done-for-You Job Search Service" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8PLLB34FQS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8PLLB34FQS', { cookie_domain: 'auto' });
            `,
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 