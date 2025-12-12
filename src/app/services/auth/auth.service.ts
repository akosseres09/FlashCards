import { inject, Injectable } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from '@angular/fire/auth';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private auth = inject(Auth);

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

    logout() {
        return signOut(this.auth);
    }

    getUser() {
        return this.auth.currentUser;
    }
}
