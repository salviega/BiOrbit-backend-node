import biorbitJson from './contracts/Biorbit.json' assert { type: 'json' }
import createAlchemyWeb3 from '@alch/alchemy-web3'
import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
var web3 = null
var contract = null
const backendWallet = '0xE8e1543235e6C35C656ef0b28526C61571583f4B'

app.use(cors(), bodyParser.json())
app.use(express.json())

async function initAPI() {
	const { MUMBAI_RPC_URL } = process.env
	web3 = createAlchemyWeb3.createAlchemyWeb3(MUMBAI_RPC_URL)
	contract = new web3.eth.Contract(biorbitJson.abi, biorbitJson.address)

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT} 🎈`)
	})
}

app.get('/relay/storeMonitoringData', (req, res) => {
	var _protectedAreaId = req.body['_protectedAreaId']
	var _protectedAreaName = req.body['_protectedAreaName']
	var _lastDetectionDate = req.body['_lastDetectionDate']
	var _totalExtension = req.body['_totalExtension']
	var _detectionDates = req.body['_detectionDates']
	var _forestCoverExtensions = req.body['_forestCoverExtensions']

	storeMonitoringData(
		_protectedAreaId,
		_protectedAreaName,
		_lastDetectionDate,
		_totalExtension,
		_detectionDates,
		_forestCoverExtensions
	)
	res.send('Data received successfully')
})

app.get('/relay/mint', (req, res) => {
	var _protectedAreaId = req.body['_protectedAreaId']
	var _protectedAreaName = req.body['_protectedAreaName']
	var _protectedAreaURI = req.body['_protectedAreaURI']

	mint(_protectedAreaId, _protectedAreaName, _protectedAreaURI)
	res.send('Data received successfully')
})

initAPI()

async function storeMonitoringData(
	_protectedAreaId,
	_protectedAreaName,
	_lastDetectionDate,
	_totalExtension,
	_detectionDates,
	_forestCoverExtensions
) {
	const nonce = await web3.eth.getTransactionCount(backendWallet, 'latest')
	const transaction = {
		from: backendWallet,
		to: biorbitJson.address,
		value: 0,
		gas: 500000,
		nonce: nonce,
		data: contract.methods
			.storeMonitoringData(
				_protectedAreaId,
				_protectedAreaName,
				_lastDetectionDate,
				_totalExtension,
				_detectionDates,
				_forestCoverExtensions
			)
			.encodeABI()
	}
	const { PRIVATE_KEY } = process.env

	const signedTx = await web3.eth.accounts.signTransaction(
		transaction,
		PRIVATE_KEY
	)

	web3.eth
		.sendSignedTransaction(signedTx.rawTransaction)
		.once('transactionHash', function (hash) {
			console.log('🎉 The hash of your transaction is: ', hash, '\n')
		})
		.once('receipt', function (receipt) {
			console.log('✅ Transaction complete!')
		})
		.once('confirmation', function (confirmationNumber, receipt) {
			console.log(
				'🔐 storeMonitoringData - Transaction confirmed! Confirmation number:',
				confirmationNumber
			)
		})
		.on('error', function (error) {
			console.log(
				'❗Something went wrong while submitting your transaction:',
				error
			)
		})
}

async function mint(_protectedAreaId, _protectedAreaName, _protectedAreaURI) {
	const nonce = await web3.eth.getTransactionCount(backendWallet, 'latest')
	const transaction = {
		from: backendWallet,
		to: biorbitJson.address,
		value: 0,
		gas: 500000,
		nonce: nonce,
		data: contract.methods
			.mint(_protectedAreaId, _protectedAreaName, _protectedAreaURI)
			.encodeABI()
	}
	const { PRIVATE_KEY } = process.env

	const signedTx = await web3.eth.accounts.signTransaction(
		transaction,
		PRIVATE_KEY
	)

	web3.eth
		.sendSignedTransaction(signedTx.rawTransaction)
		.once('transactionHash', function (hash) {
			console.log('🎉 The hash of your transaction is: ', hash, '\n')
		})
		.once('receipt', function (receipt) {
			console.log('✅ Transaction complete!')
		})
		.once('confirmation', function (confirmationNumber, receipt) {
			console.log(
				'🔐 mint - Transaction confirmed! Confirmation number:',
				confirmationNumber
			)
			sellNft()
		})
		.on('error', function (error) {
			console.log(
				'❗Something went wrong while submitting your transaction:',
				error
			)
		})
}

function sellNft() {
	getSatelliteImageIdCounter().then(satelliteImageIdCurrent => {
		const tokenId = satelliteImageIdCurrent - 1
		approve(biorbitJson.address, tokenId)
	})
}

async function approve(_to, _tokenId) {
	const nonce = await web3.eth.getTransactionCount(backendWallet, 'latest')
	const transaction = {
		from: backendWallet,
		to: biorbitJson.address,
		value: 0,
		gas: 500000,
		nonce: nonce,
		data: contract.methods.approve(_to, _tokenId).encodeABI()
	}
	const { PRIVATE_KEY } = process.env

	const signedTx = await web3.eth.accounts.signTransaction(
		transaction,
		PRIVATE_KEY
	)

	web3.eth
		.sendSignedTransaction(signedTx.rawTransaction)
		.once('transactionHash', function (hash) {
			console.log('🎉 The hash of your transaction is: ', hash, '\n')
		})
		.once('receipt', function (receipt) {
			console.log('✅ Transaction complete!')
		})
		.once('confirmation', function (confirmationNumber, receipt) {
			console.log(
				'🔐 approve - Transaction confirmed! Confirmation number:',
				confirmationNumber
			)
			sellSatelliteImage(_tokenId)
		})
		.on('error', function (error) {
			console.log(
				'❗Something went wrong while submitting your transaction:',
				error
			)
		})
}

async function sellSatelliteImage(_tokenId) {
	const nonce = await web3.eth.getTransactionCount(backendWallet, 'latest')
	const transaction = {
		from: backendWallet,
		to: biorbitJson.address,
		value: 0,
		gas: 500000,
		nonce: nonce,
		data: contract.methods.sellSatelliteImage(_tokenId).encodeABI()
	}
	const { PRIVATE_KEY } = process.env

	const signedTx = await web3.eth.accounts.signTransaction(
		transaction,
		PRIVATE_KEY
	)

	web3.eth
		.sendSignedTransaction(signedTx.rawTransaction)
		.once('transactionHash', function (hash) {
			console.log('🎉 The hash of your transaction is: ', hash, '\n')
		})
		.once('receipt', function (receipt) {
			console.log('✅ Transaction complete!')
		})
		.once('confirmation', function (confirmationNumber, receipt) {
			console.log(
				'🔐 sellSatelliteImage - Transaction confirmed! Confirmation number:',
				confirmationNumber
			)
			console.log('🌅 In sale!')
		})
		.on('error', function (error) {
			console.log(
				'❗Something went wrong while submitting your transaction:',
				error
			)
		})
}

async function getSatelliteImageIdCounter() {
	try {
		const counterValue = await contract.methods.satelliteImageIdCounter().call()
		console.log('The value of satelliteImageIdCounter is:', counterValue)
		return counterValue
	} catch (error) {
		console.log('Error getting satelliteImageIdCounter:', error)
	}
}
