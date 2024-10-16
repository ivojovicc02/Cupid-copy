require('dotenv').config()
const PORT=8000





const express = require('express')
const http = require('http');  // Kreiraj http server na pravom mjestu
const { Server } = require('socket.io');  // Uvoz socket.io
const app = express()
const {MongoClient} = require('mongodb')
const {v4:uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')
const { SessionsClient } = require('@google-cloud/dialogflow');

const server = http.createServer(app);  // Kreiraj server koji koristi Express
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // URL tvojeg frontenda
        methods: ["GET", "POST"]
    }
});












const uri = process.env.MONGODB_URI
console.log('MongoDB URI:', uri);
console.log('Test Variable:', process.env.TEST_VARIABLE);

const sessionClient = new SessionsClient();
const projectId = 'onyx-sequence-437322-n3'






  



app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.json('hello')
})

app.post('/signup',async (req,res)=>{
    const client = new MongoClient(uri)
    
    const {email,password} = req.body

    const generatedUserId = uuidv4() 
    const hashedPassword = await bcrypt.hash(password, 10)

    try{
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const exitingUser = await users.findOne({email})

        if (exitingUser){
            return res.status(409).send('user alredy exists. Please login ')
        }
        const sanitizedEmail= email.toLowerCase()
        const data={
            user_id:generatedUserId,
            email:sanitizedEmail,
            hashed_password:hashedPassword

        }
        const insertedUser = await users.insertOne(data)
        const token = jwt.sign(insertedUser,sanitizedEmail,
            {expiresIn:60*24,

            }
        )
        res.status(201).json({token,userId:generatedUserId})
    }catch{
        console.log(err)
    }
})

app.post('/login',async (req,res) => {
    const client = new MongoClient(uri)
    const {email,password} = req.body
    try{
        await client.connect()
        const database = client.db('app-data')

        const users = database.collection('users')
        const user = await users.findOne({email})

        const correctPassword = await bcrypt.compare(password, user.hashed_password)

        if (user && correctPassword){
            const token =jwt.sign(user,email,{
                expiresIn:60*24
            });
             return res.status(201).json({token,  userId: user.user_id})
        }
        return res.status(400).send('Invalid Credentials')
        

    }catch(err){
        console.log(err)
    }
    finally {
        await client.close()
    }

})

app.get('/user', async (req, res) =>{
    const client  = new MongoClient(uri)
    const userId = req.query.userId
    


    try{
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id:userId }
        const user = await users.findOne(query)
        res.send(user)
    }finally{
        await client.close()
    }
})


app.get('/users', async (req,res)=> {
    const client = new MongoClient(uri)
    const userIds = JSON.parse(req.query.UserIds)
    
    try{
        await client.connect()
        const database = client.db('app-data')
        const users =database.collection('users')

        const pipeline = [
            {
                '$match':{
                    'user_id':{
                        '$in':userIds
                    }
                }
            }
        ]
        const foundUsers = await users.aggregate(pipeline).toArray()
        
        res.send(foundUsers)
    }
    finally{
        await client.close()
    }
    

})

app.get('/gendered-users',async(req,res)=>{
    const client = new MongoClient(uri)
    const gender = req.query.gender

    
    

    try{
        await client.connect()
        const database = client.db('app-data')
        
        const users =database.collection('users')
        const query ={gender_identity:{$eq:gender}}
        const foundUsers = await users.find(query).toArray()

       
        res.send(foundUsers)
    }finally{
        await client.close()
    }
})

app.put('/user',async(req,res) => {
    const client= new MongoClient(uri)
    const formData = req.body.formData

    try{
        await client.connect()
        const database = client.db('app-data')
        const users =database.collection('users')
        const query = {user_id : formData.user_id}
        const updateDocument={
            $set:{
                first_name:formData.first_name,
                dob_day:formData.dob_day,
                dob_month:formData.dob_month,
                dob_year:formData.dob_year,
                show_gender:formData.show_gender,
                gender_identity:formData.gender_identity,
                gender_interest:formData.gender_interest,
                url:formData.url,
                about:formData.about,
                matches:formData.matches,

            },
        }
        const insertedUser= await users.updateOne(query,updateDocument)
        res.send(insertedUser)

    }finally{
        await client.close()
    }
})

app.put('/addmatch',async (req,res)=>{
    const client= new MongoClient(uri)
    const {userId,matchedUserId} = req.body

    try{
        await client.connect()
        const database = client.db('app-data')
        const users =database.collection('users')
        const query = {user_id:userId}
        const updateDocument = {
            $push: {matches: {user_id:matchedUserId}},
        }
        const user = await users.updateOne(query,updateDocument)
        res.send(user)
    }finally{
        await client.close()
    }})
   // app.get('/messages',async (req,res) =>{
       // const client= new MongoClient(uri)
       // const {userId, correspondingUserId} = req.query
        

        //try {
//await client.connect()
           // const database = client.db('app-data')
            //const messages = database.collection('messages')
    
           // const query = {
                //from_userId: userId, 
                //to_userId: correspondingUserId
           // }
           // const foundMessages = await messages.find(query).toArray()
           // res.send(foundMessages)
        
        //}
        
        
        //finally {
            //await client.close()
        //}
    //})

    app.get('/messages', async (req, res) => {
        const client = new MongoClient(uri);
        const { userId, correspondingUserId } = req.query;
    
        try {
            await client.connect();
            const database = client.db('app-data');
            const messages = database.collection('messages');
    
            const query = {
                $or: [
                    { from_userId: userId, to_userId: correspondingUserId },
                    { from_userId: correspondingUserId, to_userId: userId }
                ]
            };
    
            const foundMessages = await messages.find(query).toArray();
            res.send(foundMessages);
        } catch (err) {
            console.error('Error fetching messages:', err);
            res.status(500).send('Error fetching messages');
        } finally {
            await client.close();
        }
    });
    


app.post('/message', async (req, res) => {
        const client = new MongoClient(uri)
        const message = req.body.message
    
        try {
            await client.connect()
            const database = client.db('app-data')
            const messages = database.collection('messages')
    
            const insertedMessage = await messages.insertOne(message)
            res.send(insertedMessage)
        }catch (error) {
            console.error('Error saving message:', error);
            res.status(500).send('Error saving message');
        }  finally {
            await client.close()
        }
 }) 
 app.post('/api/message', async (req, res) => {
    console.log('Received message:', req.body.message); 
    const sessionId = uuidv4(); // Generirajte jedinstveni ID sesije
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: req.body.message,
                languageCode: 'en', 
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        console.log('Dialogflow Responses:', responses); 
        const result = responses[0].queryResult.fulfillmentText;
        res.json({ reply: result });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request');
    }
});
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Primanje događaja za pridruživanje sobi
    socket.on('join_room', ({ userId, correspondingUserId }) => {
        const roomId = [userId, correspondingUserId].sort().join('_'); // Kreiranje sobe na osnovu userId
        socket.join(roomId);
        console.log(`User with ID ${userId} joined room ${roomId}`);
    });

    // Emitiranje poruke samo korisnicima unutar sobe
    socket.on('send_message', (messageData) => {
        const { userId, correspondingUserId, message } = messageData;
        const roomId = [userId, correspondingUserId].sort().join('_'); 
    
        const messageWithTimestamp = {
            ...messageData,
            timestamp: new Date().toISOString()  // Dodaj timestamp
        };
    
        io.to(roomId).emit('receive_message', messageWithTimestamp);  // Emitiraj poruku s timestampom
    });
    

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});



  










 

     


server.listen(PORT,() => console.log('Server running on PORT '+ PORT))