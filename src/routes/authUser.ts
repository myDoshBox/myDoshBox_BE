import express, { Request, Response } from 'express';
import passport from 'passport';
import { ensureAuth, ensureGuest } from '../middleware/auth.user';

/**
 * Router for handling authentication related routes.
 */
const router = express.Router();

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
    }),
    (req: Request, res: Response) => {
        res.redirect('/log');
    }
);

router.get('/logout', (req: Request, res: Response) => {
    req.logout(() => {});
    res.redirect('/');
});


router.get('/auth/google/success', (req: Request, res: Response) => {
    res.send('Successfully authenticated with Google.');
});

router.get('/auth/google/failure', (req: Request, res: Response) => {
    res.send('Failed to authenticate with Google.');
});


router.get('/', ensureGuest, (req: Request, res: Response) => {
    res.render('login');
});

router.get("/log", ensureAuth, async (req: Request, res: Response) => {
    res.render('index', { userinfo: req.user });
});


export default router;
