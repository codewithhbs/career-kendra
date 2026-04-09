import MainScreen from '@/components/EmployerDashboard/MainScreen'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading profile...
        </div>
      }>

    <MainScreen/>
  </Suspense>
  )
}

export default page
