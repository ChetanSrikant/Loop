import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc } from "firebase/firestore";
import {toast} from "react-toastify"
import { doc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCjguJxu8dydnfAMpOp988dpHY0jWMkxPw",
  authDomain: "loop-e7ccd.firebaseapp.com",
  projectId: "loop-e7ccd",
  storageBucket: "loop-e7ccd.appspot.com",
  messagingSenderId: "1475350183",
  appId: "1:1475350183:web:770be985bff4ef4807d582"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const signup = async(username, email, password) =>{
    try{
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid),{
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey there, I'm using Loop",
            lastSeen:Date.now()
        })
        await setDoc(doc(db, "chats", user.uid),{
            chatData:[]
        })
    }catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));        
    }
}

const login = async (email,password) =>{
    try {
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async() =>{
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
    
}


export {signup, login, logout, auth, db}