import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Features from '../components/Features'

interface Conversion {
  id: string
  url: string
  filename: string
  status: 'completed' | 'processing' | 'failed'
  pdfPath?: string
}

const API_URL = 'http://localhost:8004'

export default function Home() {
  const [url, setUrl] = useState('')
  const [currentConversion, setCurrentConversion] = useState<Conversion | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsConverting(true)
    
    const conversion: Conversion = {
      id: Math.random().toString(36).substring(7),
      url,
      filename: url.replace(/^https?:\/\//, '').split('/')[0] + '.pdf',
      status: 'processing'
    }

    setCurrentConversion(conversion)
    
    try {
      const response = await axios.post(`${API_URL}/convert`, { url })
      if (!response.data.pdf_path) {
        throw new Error('No PDF path returned from server')
      }
      
      setCurrentConversion(prev => 
        prev ? { ...prev, status: 'completed', pdfPath: response.data.pdf_path } : null
      )
      toast.success('Conversion completed!')
    } catch (error: any) {
      console.error('Conversion error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to convert URL'
      setCurrentConversion(prev => 
        prev ? { ...prev, status: 'failed' } : null
      )
      toast.error(errorMessage)
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = async (conversion: Conversion) => {
    if (!conversion.pdfPath) {
      toast.error('PDF path not found')
      return
    }

    try {
      const filename = conversion.pdfPath
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
      
      setCurrentConversion(null)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download PDF')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#020420] overflow-hidden">
      {/* Top glow effect */}
      <div className="absolute inset-x-0 top-0 -z-10">
        <div className="relative w-full h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-transparent blur-3xl" />
          <div className="absolute -inset-x-20 top-0 h-[500px] bg-gradient-to-r from-violet-600/30 via-pink-500/30 to-cyan-400/30 blur-3xl opacity-70" />
        </div>
      </div>

      {/* Side glow effects */}
      <div className="absolute -left-20 top-1/2 h-72 w-72 bg-pink-500/30 rounded-full blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-72 w-72 bg-indigo-500/30 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-8">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Hero Section with additional glow */}
          <div className="relative isolate px-6 lg:px-8">
            <div className="mx-auto max-w-2xl py-16 sm:py-20">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-indigo-500 opacity-20 blur-2xl" />
                <h1 className="relative text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6">
                  Convert Any Webpage to
                  <span className="gradient-text block mt-2">PDF Format</span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                A free, open-source tool that makes web page conversion intuitive and powerful.
                Create high-quality PDFs with confidence.
              </p>
            </div>
          </div>

          {/* Conversion Form */}
          <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-xl p-2">
            <form onSubmit={handleConvert} className="flex gap-x-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="min-w-0 flex-auto rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00DC82] sm:text-sm"
              />
              <button
                type="submit"
                disabled={isConverting}
                className="flex-none rounded-lg bg-gradient-to-r from-[#00DC82] to-[#36E4DA] px-4 py-3 text-sm font-semibold text-black shadow-sm hover:opacity-90 disabled:opacity-50 transition-all duration-200"
              >
                {isConverting ? 'Converting...' : 'Convert to PDF'}
              </button>
            </form>
          </div>

          {/* Current Conversion */}
          {currentConversion && (
            <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-[#00DC82]">
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
                    <div className="text-sm font-medium text-white">
                      {currentConversion.url}
                    </div>
                    <div className="text-sm text-gray-400">
                      {currentConversion.filename}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {currentConversion.status === 'completed' ? (
                    <>
                      <span className="inline-flex items-center rounded-full bg-[#00DC82]/20 px-3 py-1 text-xs font-medium text-[#00DC82]">
                        Completed
                      </span>
                      <button
                        onClick={() => handleDownload(currentConversion)}
                        className="inline-flex items-center rounded-lg bg-[#00DC82] px-3 py-1 text-xs font-medium text-black hover:opacity-90"
                      >
                        Download PDF
                      </button>
                    </>
                  ) : currentConversion.status === 'processing' ? (
                    <span className="inline-flex items-center rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                      Processing
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Features section */}
          <Features />

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-gray-400">
            Open source and free forever. No registration required.
            <br />
            Your privacy matters - files are automatically deleted after download.
          </div>
        </div>
      </div>
    </div>
  )
}
