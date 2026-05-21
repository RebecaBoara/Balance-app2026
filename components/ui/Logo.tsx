import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const SIZE = {
  sm: { h: 28, text: 'text-2xl' },
  md: { h: 36, text: 'text-3xl' },
  lg: { h: 48, text: 'text-4xl' },
}

export default function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const { h, text } = SIZE[size]

  return (
    <Link href={href}
      className={`inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity ${className}`}>
      <Image
        src="/lotus.PNG"
        height={0}
        width={0}
        sizes="10vw"
        alt=""
        style={{ height: h, width: 'auto' }}
        className="[mix-blend-mode:multiply] [filter:sepia(0.4)_hue-rotate(90deg)_saturate(2)_brightness(0.6)] dark:[mix-blend-mode:screen] dark:[filter:invert(1)_hue-rotate(180deg)_saturate(1.8)_brightness(1.3)]"
      />
      <span className={`font-script ${text} text-sage-500 dark:text-white`}>
        Balance
      </span>
    </Link>
  )
}
