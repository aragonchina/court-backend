import Court from '@aragonone/court-backend-shared/models/Court'
import Environment from '@aragonone/court-backend-shared/models/evironments/BrowserEnvironment'

const FAUCET = {
  staging: '0x9a2F850C701b457b73c8dC8B1534Cc187B33F5FD',
  ropsten: '0x83c1ECDC6fAAb783d9e3ac2C714C0eEce3349638',
  rinkeby: '0x3b86Fd8C30445Ddcbed79CE7eB052fe935D34Fd2',
  usability: '0x109dB6047d83f4dd5a8d9da3b9e9228728E3710a',
}

const ANT = {
  staging: '0x245B220211b7D3C6dCB001Aa2C3bf48ac4CaA03E',
  ropsten: '0x0cb95D9537c8Fb0C947eD48FDafc66A7b72EfC86',
  rinkeby: '0x5cC7986D7A793b9930BD80067ca54c3E6D2F261B',
  usability: '0xbF932fdf8D600398d64614eF9A10401fF046f449',
  mainnet: '0x960b236A07cf122663c4303350609A66A7B288C0'
}

const Network = {
  get environment() {
    return new Environment(this.getNetworkName())
  },

  async query(query) {
    return this.environment.query(query)
  },

  async isEnabled() {
    return this.environment.isEnabled()
  },

  async getAccount() {
    return this.environment.getSender()
  },

  async getBalance(address) {
    const provider = await this.environment.getProvider()
    return provider.getBalance(address)
  },

  async getCourt(address) {
    if (!this.court) {
      const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')
      const court = await AragonCourt.at(address)
      this.court = new Court(court, this.environment)
    }
    return this.court
  },

  async getANT() {
    const antAddress = ANT[this.getNetworkName()]
    if (!this.ant && antAddress) {
      const MiniMeToken = await this.environment.getArtifact('MiniMeToken', '@aragon/minime')
      this.ant = await MiniMeToken.at(antAddress)
    }
    return this.ant
  },

  async getFaucet() {
    const faucetAddress = FAUCET[this.getNetworkName()]
    if (!this.faucet && faucetAddress) {
      const ERC20Faucet = await this.environment.getArtifact('ERC20Faucet', '@aragon/erc20-faucet')
      this.faucet = await ERC20Faucet.at(faucetAddress)
    }
    return this.faucet
  },

  async isCourtAt(address) {
    try {
      await this.getCourt(address)
      return true
    } catch (error) {
      if (error.message.includes(`no code at address ${address}`)) return false
      else throw error
    }
  },

  async isFaucetAvailable() {
    try {
      await this.getFaucet()
      return true
    } catch (error) {
      if (error.message.includes(`no code at address`)) return false
      else throw error
    }
  },

  getNetworkName() {
    const network = process.env.REACT_APP_NETWORK
    if (!network) throw Error('A network must be specified through a NETWORK env variables')
    return network
  },
}

export default Network
