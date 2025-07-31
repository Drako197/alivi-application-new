import React from 'react'
import Lottie from 'lottie-react'
import loaderAnimation from '../assets/animations/loader2.json'

interface LottieLoaderProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const LottieLoader: React.FC<LottieLoaderProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-45 h-45'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        autoplay={true}
        className={sizeClasses[size]}
        style={{
          // Simple hardware acceleration
          transform: 'translateZ(0)'
        }}
      />
    </div>
  )
}

export default LottieLoader 