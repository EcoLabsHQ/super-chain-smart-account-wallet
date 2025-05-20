import type { NextPage } from 'next'
import Head from 'next/head'
import Turnstile from 'react-cloudflare-turnstile'
import Badges from '@/components/badges'
import { useState } from 'react'

const Home: NextPage = () => {
  const [token, setToken] = useState<string | null>(null)
  const handleToken = (token: string) => {
    setToken(token)
    console.log('Captcha token:', token)
  }
  return (
    <>
      <Head>
        <title>Super Account - Badges</title>
      </Head>

      <main>
        <Badges />
        <Turnstile callback={handleToken} turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />
      </main>
    </>
  )
}

export default Home
