import Head from 'next/head'
import React from 'react'
import Vaults from '@/components/vaults'
function VaultsPage() {
  return (
    <>
      <Head>
        <title>Super Account - Vaults</title>
      </Head>

      <main>
        <Vaults />
      </main>
    </>
  )
}

export default VaultsPage
