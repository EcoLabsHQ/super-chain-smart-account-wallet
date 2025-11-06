// import type { NextPage } from 'next'
// import Head from 'next/head'
// import Turnstile from 'react-turnstile'
// import Badges from '@/components/badges'
// import { useState } from 'react'

// const Home: NextPage = () => {
//   const [token, setToken] = useState<string | null>(null)
//   const handleToken = (token: string) => {
//     setToken(token)
//     console.log('Captcha token:', token)
//   }
//   return (
//     <>
//       <Head>
//         <title>Super Account - Season 7 Badges</title>
//       </Head>

//       <main>
//         <Badges season={{ code: 7, name: 'Season 7', isActive: false }} captchaToken={token} />
//         <Turnstile onSuccess={handleToken} sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />
//       </main>
//     </>
//   )
// }

// export default Home
