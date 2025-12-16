import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return done(null, false);
    }

    done(null, {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });
  } catch (error) {
    done(error);
  }
});

export default passport;
