import CountUp from 'react-countup'

interface CountUpNumberProps {
  end: number
  decimals?: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function CountUpNumber({
  end,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: CountUpNumberProps) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      <CountUp
        end={end}
        decimals={decimals}
        suffix={suffix}
        prefix={prefix}
        duration={duration}
        separator=","
      />
    </span>
  )
}
