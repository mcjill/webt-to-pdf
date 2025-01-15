import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">Web2PDF</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
