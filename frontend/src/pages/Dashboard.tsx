import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

interface Conversion {
  id: string
  url: string
  filename: string
  date: string
  status: 'completed' | 'processing' | 'failed'
  pdfPath?: string
}

const API_URL = 'http://localhost:8003'

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setIsConverting(true)
    
    const newConversion: Conversion = {
      id: Math.random().toString(36).substring(7),
      url,
      filename: url.replace(/^https?:\/\//, '').split('/')[0] + '.pdf',
      date: new Date().toISOString().split('T')[0],
      status: 'processing'
    }

    setConversions(prev => [newConversion, ...prev])
    
    try {
      const response = await axios.post(`${API_URL}/convert`, { url })
      
      setConversions(prev => 
        prev.map(conv => 
          conv.id === newConversion.id 
            ? { ...conv, status: 'completed', pdfPath: response.data.pdf_path } 
            : conv
        )
      )
      toast.success('Conversion completed!')
    } catch (error) {
      setConversions(prev => 
        prev.map(conv => 
          conv.id === newConversion.id 
            ? { ...conv, status: 'failed' } 
            : conv
        )
      )
      toast.error('Failed to convert URL')
    } finally {
      setIsConverting(false)
      setUrl('')
    }
  }

  const handleDownload = async (conversion: Conversion) => {
    if (conversion.status !== 'completed') {
      toast.error('PDF is not ready for download yet')
      return
    }

    if (!conversion.pdfPath) {
      toast.error('PDF path not found')
      return
    }

    try {
      const filename = conversion.pdfPath.split('/').pop()
      const response = await axios.get(
        `${API_URL}/download/${filename}`,
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = conversion.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Convert URL to PDF</h2>
          <p className="text-gray-600 mb-4">
            Enter a URL below to convert it to a PDF document.
          </p>
          <form onSubmit={handleConvert} className="flex gap-x-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <button
              type="submit"
              disabled={isConverting}
              className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isConverting ? 'Converting...' : 'Convert to PDF'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Conversions</h2>
          {conversions.length === 0 ? (
            <p className="text-gray-600">
              Your recently converted PDFs will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {conversions.map((conversion) => (
                <div
                  key={conversion.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-400">
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {conversion.url}
                      </div>
                      <div className="text-sm text-gray-500">
                        {conversion.filename}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">{conversion.date}</div>
                    <div className="flex items-center space-x-2">
                      {conversion.status === 'completed' ? (
                        <>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Completed
                          </span>
                          <button
                            onClick={() => handleDownload(conversion)}
                            className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 hover:bg-indigo-100"
                          >
                            Download PDF
                          </button>
                        </>
                      ) : conversion.status === 'processing' ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
