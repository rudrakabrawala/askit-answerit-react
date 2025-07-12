
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBar = ({ value, onChange, placeholder = "Search questions..." }: Props) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`relative flex items-center border rounded-lg transition-all ${
      isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
    }`}>
      <Search className="h-5 w-5 text-gray-400 ml-3" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 outline-none bg-transparent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
