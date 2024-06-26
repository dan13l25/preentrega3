import passport from "passport";
import local from "passport-local";
import userModel from "../dao/models/users.js";
import { createHash, isValidPassword } from "../utils.js";
import GitHubStrategy from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PRIVATE_KEY, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } from "../utils.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use("register", new LocalStrategy({
        passReqToCallback: true, 
        usernameField: "email"
    }, async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;
        try {
            const user = await userModel.findOne({ email });
            if (user) {
                console.log("Usuario ya existe");
                return done(null, false);
            }
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role: "user"
            };
            const result = await userModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(error);  
        }
    }));

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            const user = await userModel.findOne({ email });
            if (!user) return done(null, false);
            const valid = isValidPassword(user, password);
            if (!valid) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("github", new GitHubStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            const user = await userModel.findOne({ email: profile._json.email });
            if (!user) {
                const newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 20,
                    email: profile._json.email,
                    password: "",
                };
                let createdUser = await userModel.create(newUser);
                done(null, createdUser);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("current", new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies["jwtToken"]]),
        secretOrKey: PRIVATE_KEY,
    }, async (payload, done) => {
        try {
            const user = await userModel.findById(payload._id);
            if (!user) {
                return done(null, false, { message: "Usuario no encontrado" });
            }
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            if (!user) {
                return done(null, false); 
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
};

export default initializePassport;
