import SignUpForm from '@/components/Login/SignUpForm'
import React, { Suspense } from 'react'

const page = () => {
  return <Suspense fallback={"...Loading"}><SignUpForm/></Suspense>
}

export default page
