const express = require('express')
const User = require('../models/user')
const verify = require('../authentication/verify')
const router = new express.Router()

router.get('/', (req, res) => {
	res.render('index')
})

router.get('/signup', (req, res) => {
	res.render('signup')
})

router.get('/signin', (req, res) => {
	res.render('signin')
})

router.get('/user/chats', verify, (req, res) => {
	res.render('chats')
})

//creating user
router.post('/user/signup', async (req, res) => {
	try {
		const user = new User(req.body)
		const token = await user.generateJwtToken()

		await user.save()
		res.cookie("jwt", token)
		res.status(200)
		res.redirect('chats')
	} catch(err) {
		res.status(400).send({
			msg: "unable to create account",
		})
	}
})

//logging in
router.post('/user/signin', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateJwtToken()

		if(!user) res.status(404).send({msg: "user not found"})

		res.cookie("jwt", token)
		res.status(200)
		res.redirect('chats')
	} catch (err) {
		res.status(400).send({
			msg: "user not found",
		})
	}
})

//updating user profile
router.patch('/user/updateProfile', verify, async (req, res) => {
	try {
		const user = req.user 
		user.name = req.body.name ? req.body.name : user.name
		user.username = req.body.username ? req.body.username : user.username
		user.email = req.body.email ? req.body.email : user.email
		user.password = req.body.password ? req.body.password : user.password

		await user.save()
		res.status(200).send({
			msg: "user updated successfully"
		})
	} catch (err) {
		res.status(400).send({
			msg: "can not modify user profile"
		})
	}
})

//logging out
router.delete('/user/signout', verify, async(req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

		await req.user.save()
		res.status(200).send({
			msg: "user signed out successfully"
		})
	} catch(err) {
		res.status(404).send({
			msg: "something went wrong"
		})
	} 
})

//adding a friend
router.post('/user/chats/addFriend', verify, async (req, res) => {
	try {
		// const username = req.body.username
		const user = await User.findOne({username: req.body.username})
		if(!user) res.send({
			msg: "user not found"
		})
		await req.user.friends.push(user._id)
		await req.user.save()
		res.redirect('/user/chats')
	} catch(err) {
		res.status(404).send({
			msg: "could not add friend",
			err
		})
	}
})

router.get('/user/chats/friends', verify,  async (req, res) => {
	try {
		let allFrnds = []
		for (f of req.user.friends) {
			const user = await User.findById(f)
			allFrnds.push({
				_id: user._id,
				name: user.name,
				username: user.username
			})
		}
 
		res.send(allFrnds)
	} catch(err) {
		res.send({
			msg: "can not get friends",
			err
		})
	}
})

router.get('/user/profile', verify, (req, res) => {
	try {
			const user = {
				name: req.user.name, 
				username: req.user.username,
				email: req.user.email
			}
			res.send(user)
	} catch (err) {
		res.send({
			msg: "can not get user profile"
		})
	}
})

module.exports = router 