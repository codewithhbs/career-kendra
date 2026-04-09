import DocumentUploadPage from '@/components/DocumentUpload'
import React, { Suspense } from 'react'

const page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DocumentUploadPage />
        </Suspense>
    )
}

export default page