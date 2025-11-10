import OETH from '@/public/images/currencies/ethereum.svg'
import WETH from '@/public/images/currencies/weth.svg'
import OP from '@/public/images/currencies/optimism.svg'
import USDC from '@/public/images/currencies/usdc.svg'
import USDT from '@/public/images/currencies/usdt.svg'
import { SvgIconComponent } from '@mui/icons-material'

export type Token = {
  values: number[]
  decimals: number
  address: string
  icon: SvgIconComponent
}

export const tokens: Record<string, Token> = {
  ETH: { values: [0.02, 0.05, 0.1], decimals: 18, address: '0x0000000000000000000000000000000000000000', icon: OETH },
  WETH: { values: [0.02, 0.05, 0.1], decimals: 18, address: '0x4200000000000000000000000000000000000006', icon: WETH },
  OP: { values: [10, 20, 50], decimals: 18, address: '0x4200000000000000000000000000000000000042', icon: OP },
  USDC: { values: [25, 50, 100], decimals: 6, address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', icon: USDC },
  USDT: { values: [25, 50, 100], decimals: 6, address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', icon: USDT },
}
