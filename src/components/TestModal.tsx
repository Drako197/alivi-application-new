import { createPortal } from 'react-dom'

interface TestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TestModal({ isOpen, onClose }: TestModalProps) {
  console.log('TestModal render - isOpen:', isOpen)
  
  if (!isOpen) {
    console.log('TestModal not rendering - isOpen is false')
    return null
  }

  console.log('TestModal rendering modal content')

  return createPortal(
    <div className="fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-[99999] p-4">
      {/* Test Button - Using absolute positioning within the relative overlay */}
      <div className="absolute bottom-6 left-6 z-[999999]">
        <button
          onClick={() => alert('Test Modal Button Works!')}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
        >
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-lg font-bold">✓</span>
          </div>
        </button>
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
          TEST
        </div>
      </div>

      {/* Modal Content */}
      <div className="bg-yellow-400 border-4 border-black rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <h2 className="text-xl font-bold text-black">🔥 TEST MODAL 🔥</h2>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 text-black hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-black mb-4 font-bold">
            🎉 THIS IS A TEST MODAL! 🎉
            <br />
            You should see a green checkmark button in the bottom-left corner.
          </p>
          
          {/* Test Button Inside Modal Content */}
          <div className="mb-4">
            <button
              onClick={() => alert('Button Inside Modal Content Works!')}
              className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-lg font-bold">Y</span>
              </div>
            </button>
          </div>
          
          <button
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
} 