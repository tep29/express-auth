const express = require('express')
const { User } = require('./models')
const app = express()
app.use(express.json())

// token 秘钥
const jwt = require('jsonwebtoken')
const SECRET = "tokenKeyAM293Q"

app.get('/', async (req, res) => {
     res.send('ok')
})

app.get('/api/users', async (req, res) => {
     const users = await User.find()
     res.send(users)
})



app.post('/api/register', async (req, res) => {
     const { username, password } = req.body
     const user = await User.create({
          username,
          password
     })

     res.send(user)
})

app.post('/api/login', async (req, res) => {
     const { username, password } = req.body
     const user = await User.findOne({
          username
     })
     if (!user) {
          return res.status(422).send({
               message: "用户名不存在"
          })
     }

     const isPasswordValid = require('bcrypt').compareSync(
          password,
          user.password
     )
     if (!isPasswordValid) {
          return res.status(422).send({
               message: "密码无效"
          })
     }

     // 生成token
     const tokenData = jwt.sign({
          _id: String(user._id)
     }, SECRET)

     res.send({
          user,
          token: tokenData
     })
})


const auth = async (req, res, next) => {
     const raw = String(req.headers.authorization).split(' ').pop()
     const { _id } = jwt.verify(raw, SECRET)
     req.user = await User.findById(_id)
     next()
}

app.get('/api/profile', auth, async (req, res) => {
     res.send(req.user)
})

// 例子：
app.get('/api/orders', auth, async (req, res) => {
     const orders = await orders.find().where({
          user: req.user
     })
     res.send(orders)
})




app.listen(3000, () => {
     console.log("http://localhost:3000")
})