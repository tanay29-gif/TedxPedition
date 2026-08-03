import {
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "firebase/auth";

import { auth, googleProvider } from "../firebase/firebase";

export async function signInGoogle() {

    const result = await signInWithPopup(
        auth,
        googleProvider
    );

    return result.user;

}

export async function logout(){

    await signOut(auth);

}

export function authListener(callback){

    return onAuthStateChanged(
        auth,
        callback
    );

}