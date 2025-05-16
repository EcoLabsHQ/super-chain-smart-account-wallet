import Campaigns from '@/components/campaigns'
import Head from 'next/head'
import React from 'react'

function CampaignsPage() {
  return (
    <>
      <Head>
        <title>Super Account - Campaigns</title>
      </Head>

      <main>
        <Campaigns />
      </main>
    </>
  )
}

export default CampaignsPage
