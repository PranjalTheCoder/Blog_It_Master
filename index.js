const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'upload/' });
const fs = require('fs');
const connectDb = require("./config/db")

// USED FOR ENCRYPTING THE PASSWORD FOR USER
const salt = bcrypt.genSaltSync(10);

// SECRET KEY FOR COOKIE
const secret = 'bhjbdjwj3b34b43bhj42jjsjjhbjdcjwa';

// USED FOR MAKIG REQUEST FROM ONE SIDE TO OTHER , LIKE FROM CLIENT - SERVER AND VICE VERSA
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());

// USED TO ACCES COOKIES , THAT WE GOT FROM SERVER
app.use(cookieParser());

app.use('/upload', express.static(__dirname + '/upload'));

// MONGO DB Connection 
connectDb();

// USER REGISTERATION
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        })
        res.json(userDoc);
    }
    catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});


// USER LOGIN
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username);
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        // -- logged in ---
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    }
    else {
        res.status(400).json('wrong credentials');
    }
});
// app.post('/register', async (req, res) => {
//     // console.log(req.body);
//     const { username, password } = req.body;
//     try {
//         // to handle unique users registration, use try-catch
//         const userDoc = await User.create({
//             username,
//             password: bcrypt.hashSync(password, salt),
//         });
//         res.json(userDoc);
//         console.log(userDoc);
//     } catch (error) {
//         res.status(400).json(error);
//     }

// })



// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     const userDoc = await User.findOne({ username: username })
//     //now to verify the password user is inserting, we need to compare the password that is encrypted by bcrypt and stored in our db(userDoc.password) with the password user is inserting(password)
//     const passOk = bcrypt.compareSync(password, userDoc.password); // true-if pass matches else false
//     if (passOk) {
//         //logged in
//         jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
//             if (err) throw err;
//             //saving jwt created of user as cookie
//             res.cookie('token', token).json({
//                 id: userDoc._id,
//                 username,
//             });
//             //token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByaXR1IiwiaWQiOiI2NDExYmZhNGZmY2ExNmE1NDQ5NzBjZWQiLCJpYXQiOjE2Nzg4ODgyMDV9.cv4ENQqQPkVCfKVY4P4lbIEmzqZ0q51aemAYakbk_yw; 
//         });

//     } else {
//         res.status(404).json('wrong credentials');
//     }

// })

// GETTING USER INFO TO CHECK IF USER IS SIGN IN OR NOT USING COOKIE 
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
    // res.json(req.cookies);
});


//  LOGOUT FUNCTIONALITY
app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});


// POSTING NEW THREAD & SENDING IT TO DATABASE
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    console.log("dkkdk")
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        res.json(postDoc);
    });
});

// UPDATE POST AND SEND BACK TO DATABASE
// app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
//     let newPath = null;
//     if (req.file) {
//         const { originalname, path } = req.file;
//         const parts = originalname.split('.');
//         const ext = parts[parts.length - 1];
//         const newPath = path + '.' + ext;
//         fs.renameSync(path, newPath);
//     }
//     const { token } = req.cookies;
//     jwt.verify(token, secret, {}, async (err, info) => {
//         if (err) throw err;
//         const { id, title, summary, content } = req.body;

//         const postDoc = await Post.findById(id);
//         const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

//         if (!isAuthor) {
//             return res.status(400).json('You are not the author');
//         }
//         await postDoc.update({
//             title,
//             summary,
//             content,
//             cover: newPath ? newPath : postDoc.cover,
//         });
//         res.json(postDoc);
//     });
// });
app.put('/post', uploadMiddleware.single('file'), (req, res) => {
    // res.json({files:req.file});
    let newPath = null; //if wa have req.file then we will rename it
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }
    const { token } = req.cookies; // to grab author name from jwt token that is stored in cookie
    jwt.verify(token, secret, {}, async (err, decodedInfo) => {
        if (err) throw err;
        //now we want everything from payload(title,summary,content,file) that is in req.body to store in our db
        const { title, summary, content, id } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(decodedInfo.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        })
        res.json(postDoc);
    })

})

// Displaying All post from the Database in Home / Dashboard
app.get('/post', async (req, res) => {
    const posts = await Post.find().populate('author', ['username']).sort({ createdAt: -1 }).limit(20); //sorting the post in descending order, so latest post shows at the top //limit : Specifies the maximum number of documents the query will return
    res.json(posts);
})

// Expanding Single Page Post
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

// like a post
app.put('/likepost', async (req, res) => {
    const { postId, userId } = req.body;
    let post1 = await Post.findById(postId).populate('author');
    let creator = post1.author._id;
    let creator_likes = post1.author.likes;

    // post details
    let likeduser = post1.likeduser;
    let likes = post1.likes;

    let result;
    // if post has been liked by user then dislike
    if (likeduser.includes(userId)) {
        result = await Post.updateMany({ _id: postId },
            {
                $pull: { likeduser: { $in: [userId] } },
                $set: { likes: likes - 1 }
            })
        await User.updateMany({ _id: creator },
            {
                $set: { likes: creator_likes - 1 }
            })
    }
    // if post has not been liked by user then like it
    else {
        result = await Post.updateMany(
            { _id: postId },
            {
                $push: { likeduser: userId },
                $set: { likes: likes + 1 }
            })
        await User.updateMany({ _id: creator },
            {
                $set: { likes: creator_likes + 1 }
            })
    }
    let post = await Post.findById(postId);
    res.json({ result, likeduser, likes, post });
})

app.listen(4000);


