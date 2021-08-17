import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', post: 5001, protocol: 'https'})

class App extends Component {

  async componentWillMount() {
    this.loadWeb3()    
    this.loadBlockchainData()

  }

  async loadBlockchainData() {
    const web3 = window.web3
    // fetch accounts from the blockchain
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})

    const networkId = await web3.eth.net.getId()
    // load decentragram
    const decentragramData =  Decentragram.networks[networkId]; 

    if(decentragramData) { 

      const decentragram = new web3.eth.Contract(Decentragram.abi, decentragramData.address)
      this.setState({decentragram})
      // load images
      const imageCount = await decentragram.methods.imageCount().call()
      this.setState({imageCount: imageCount})

      for(let i = 0; i < imageCount; i++) {

        const image = await decentragram.methods.images(i).call()
      
        this.setState({ 
          images: [...this.state.images, image]
         })
      }
    }

    //sort images by tip amaunt
    this.setState({
      images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount)
    })

    this.setState({ loading: false })
  }

  async loadWeb3() {

    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-ethereum browser detected. Consider trying metamask')
    }

  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer', this.state.buffer)
    }

  }

  uploadImage = description => {

    console.log('submitting file to ipfs..')

    ipfs.add(this.state.buffer, (error, result) => {
      console.log('ipfs result', result)
      if(error) {
        console.log(error)
      }

      this.setState({ loading: true })
        this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
      })

    })
  }

  tipImageOwner = (id, tipAmount) => {
    this.setState({ loading: true })
    this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })  
    })

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: {},
      images: [],
      loading: true
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main 
              captureFile={ this.captureFile }
              uploadImage={ this.uploadImage }
              images={ this.state.images }
              tipImageOwner= { this.tipImageOwner }
            />
          }
      </div>
    );
  }
}

export default App;