const encodeFormData = require('../utils/actions');
const querystring = require('querystring');
const fetch = require('node-fetch')
const got = require('got');
const User = require('../models/userModel');
const hookAsync = require('../utils/hookAsync');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
//oauth through spotify api

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, req, res, ) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        sameSite: "none",
        secure: true,
        domain: "https://imusicroom.netlify.app",
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    user.password = undefined //remove password from response output

}


exports.login = async(req, res) => {
    const scope =
        `streaming 
user-read-email 
user-read-private 
user-library-read 
user-library-modify 
user-read-playback-state 
user-modify-playback-state
    `;

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECTURI
        })
    );
}

let isloggedDone = false;
let query;
//gets log user credentials
exports.logged = async(req, res, next) => {

    const body = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: process.env.REDIRECTURI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    }

    await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            body: encodeFormData(body)
        })
        .then(response => response.json())

    .then(data => {
        query = querystring.stringify(data);


    }).catch(err => res.redirect(`${process.env.CLIENT_REDIRECTURI}`))
    next()

};

exports.getUser = hookAsync(async(req, res) => {
    let userQuery = query.split('&')[0];
    let { body } = await got(`https://api.spotify.com/v1/me?${userQuery}`, { json: true });
    //console.log(body);
    //extract name,email,photo
    if (!body) {
        res.redirect(`${process.env.CLIENT_REDIRECTURI}`)
    }
    const findUser = await User.find({ email: body.email })

    if (findUser.length === 0) {
        //we store spotify user data in our database
        const newUser = await User.create({
            name: body.display_name,
            email: body.email,
            password: body.id,
            passwordConfirm: body.id,
            photo: body.images[0].url
        });

        createSendToken(newUser, req, res)
        res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`);

    } else {
        const user = await User.findOne({ email: body.email }).select('+password');

        if (!user || !(await user.correctPassword(body.id, user.password))) {
            return next(new AppError('Incorrect email or password', 401))
        }

        createSendToken(user, req, res)
        res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`);



    }
})


exports.refreshToken = async(req, res) => {

        // requesting access token from refresh token
        const scope =
            `streaming 
user-read-email 
user-read-private 
user-library-read 
user-library-modify 
user-read-playback-state 
user-modify-playback-state
    `;
        let refresh_token = 'AQDkyEOVZ4QUy_9nCdJu23eJ84-usOM5dkOlYZ9Cdm6eDnBF65nTrxahu_HVT6C7XwzJ38Bp9XkkgWbLddp-012hDLd-8S8Ap-PUSDi9vNnyOo3ALfWY3GswWFjNjVm2tWE'
            // req.cookies.refresh_token;

        axios({
                    method: "post",
                    url: "https://accounts.spotify.com/api/token",
                    data: querystring.stringify({
                        grant_type: "refresh_token",
                        scope: scope,
                        refresh_token: refresh_token,
                    }),
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${new Buffer.from(
                `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
            ).toString("base64")}`,
        },
    })
        .then((response) => {

            res.cookie('access_token', response.data.access_token);
            res.redirect(`${process.env.CLIENT_REDIRECTURI}?access_token=${response.data.access_token}`);
        })
        .catch((error) => {
            res.redirect(`${process.env.CLIENT_REDIRECTURI}`);
        });

};