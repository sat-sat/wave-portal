import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './utils/WavePortal.json'

const App = () => {
  const [allWaves, setAllWaves] = useState([])
  const [currentAccount, setCurrentAccount] = useState('')
  const [isWritingMessage, setIsWritingMessage] = useState(false)
  const [message, setMessage] = useState('')
  const contractAddress = '0x1Ac65C9a079f0D19fC6D4F515D664194bbC23abD'
  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    try {
      /**
       * First make sure we have access to window.ethereum
       */
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask!')
      } else {
        console.log('We have the ethereum object', ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account: ', account)
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000
        })
        console.log('Mining...', waveTxn.hash)

        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)

        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        setIsWritingMessage(false)
        setMessage('')
      } else {
        console.log('Ethereum object does not exist!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = useCallback(async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        })

        setAllWaves(wavesCleaned)
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (error) {}
  }, [contractABI])

  const onInputChange = evt => {
    evt.preventDefault()

    setMessage(evt.target.value)
  }

  const onCancelMessage = () => {
    setIsWritingMessage(false)
    setMessage('')
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    getAllWaves()
  }, [getAllWaves])

  useEffect(() => {
    let wavePortalContract

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message)
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message
        }
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      wavePortalContract.on('NewWave', onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [contractABI])

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='header'>👋 Hey there!</div>

        <div className='bio'>Beep boop, I am Satoru. Bop, boop...</div>

        {!isWritingMessage && (
          <button
            className='waveButton'
            onClick={() => setIsWritingMessage(true)}
          >
            Wave at Me
          </button>
        )}

        {isWritingMessage && (
          <div className='message-form'>
            <input
              value={message}
              type='text'
              placeholder='Write a message!'
              onChange={onInputChange}
            />
            <button className='waveButton small-margin' onClick={wave}>
              Send
            </button>
            <button
              className='waveButton small-margin'
              onClick={onCancelMessage}
            >
              Cancel
            </button>
          </div>
        )}

        {!currentAccount && (
          <button className='waveButton' onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'OldLace',
                marginTop: '16px',
                padding: '8px'
              }}
            >
              <table>
                <tbody>
                  <tr>
                    <td>Address</td>
                    <td>: {wave.address}</td>
                  </tr>
                  <tr>
                    <td>Time</td>
                    <td>: {wave.timestamp.toString()}</td>
                  </tr>
                  <tr>
                    <td>Message</td>
                    <td>: {wave.message}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
