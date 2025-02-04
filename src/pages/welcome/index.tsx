import type { NextPage } from 'next'
import Head from 'next/head'
import NewSafe from '@/components/welcome/NewSafe'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from '@/hooks/useSafeInfo'

const Welcome: NextPage = () => {
  const { safe, safeAddress } = useSafeInfo()
  const router = useRouter()
  useEffect(() => {
    if (safeAddress) {
      router.push({
        pathname: AppRoutes.home,
        query: { safe: safeAddress },
      })
    }
  }, [safeAddress])

  return (
    <>
      <Head>
        <title>SuperChain Smart Accounts – Welcome</title>
      </Head>

      <NewSafe />
    </>
  )
}

export default Welcome
