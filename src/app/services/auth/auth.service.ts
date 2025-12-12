import { inject, Injectable } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    user,
    User,
    sendPasswordResetEmail,
    sendEmailVerification,
    ActionCodeSettings,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private auth = inject(Auth);
    user$: Observable<User | null>;

    constructor() {
        this.user$ = user(this.auth);
    }

    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    signup(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(this.auth, provider);
    }

    sendResetEmail(email: string) {
        const actionCodeSettings: ActionCodeSettings = {
            url: environment.hostUrl + '/reset-password',
            handleCodeInApp: true,
        };
        return sendPasswordResetEmail(this.auth, email, actionCodeSettings);
    }

    resetPassword(email: string) {}

    sendVerificationEmail() {
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            const actionCodeSettings: ActionCodeSettings = {
                url: environment.hostUrl + '/projects',
                handleCodeInApp: true,
            };
            return sendEmailVerification(currentUser, actionCodeSettings);
        }
        return Promise.reject('No user is currently signed in');
    }

    logout() {
        return signOut(this.auth);
    }

    getUser() {
        return this.auth.currentUser;
    }
}
