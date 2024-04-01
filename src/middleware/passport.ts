import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Profile } from 'passport-google-oauth20';
import { PassportStatic } from 'passport';
import Users, { UserDocument } from '../models/User.google';

export default function (passport: PassportStatic): void {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
        passReqToCallback: true,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: UserDocument | false) => void
      ) => {
        // Get the user data from Google 
        const newUser: Partial<UserDocument> = {
          sub: profile.id,
          name: profile.displayName,
          picture: profile.photos?.[0].value,
          email: profile.emails?.[0].value,
          email_verified: !!profile.emails?.[0].verified,

        };

        try {
          // Find the user in our database 
          let user = await Users.findOne({ sub: profile.id });

          if (user) {
            // If user is present in our database.
            done(null, user);
          } else {
            // If user is not present in our database, save user data to database.
            user = await Users.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err as Error, false);
        }
      }
    )
  );

  // Serialize the user id to store in the session
  passport.serializeUser((user: UserDocument, done) => {
    done(null, user.id);
  });