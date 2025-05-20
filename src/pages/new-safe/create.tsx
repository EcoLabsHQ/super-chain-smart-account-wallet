import Head from 'next/head'
import type { NextPage } from 'next'
import CreateSafe from '@/components/new-safe/create'
import { PendingSafeProvider } from '@/components/new-safe/create/steps/StatusStep/PendingSafeContext'

const Open: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Super Account – Create Safe Account</title>
      </Head>

      <PendingSafeProvider>
        <CreateSafe />
      </PendingSafeProvider>
    </main>
  )
}

export default Open
