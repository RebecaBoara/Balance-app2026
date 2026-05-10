import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const SIZE = {
  sm: { text: 'text-2xl', icon: 16 },
  md: { text: 'text-3xl', icon: 20 },
  lg: { text: 'text-4xl', icon: 24 },
}

//function HibiscusIcon({ size }: { size: number }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//       {[0, 72, 144, 216, 288].map(angle => (
//         <ellipse
//           key={angle}
//           cx="12"
//           cy="7.5"
//           rx="2.2"
//           ry="4.5"
//           transform={`rotate(${angle}, 12, 12)`}
//           opacity="0.88"
//         />
//       ))}
//       <circle cx="12" cy="12" r="1.8" />
//     </svg>
//   )
// }

export default function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const { text, icon } = SIZE[size]

  return (
    <Link href={href}
      className={`flex items-center gap-1.5 font-script ${text}
                  text-sage-500 dark:text-teal-400
                  hover:opacity-80 transition-opacity ${className}`}>
      {/* <HibiscusIcon size={icon} /> */}
      Balance
    </Link>
  )
}
