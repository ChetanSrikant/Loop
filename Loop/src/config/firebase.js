import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgz8iVEd9T8mGVmFRnM_QezTaJN_Tuvx0",
  authDomain: "loop-bfc7c.firebaseapp.com",
  projectId: "loop-bfc7c",
  storageBucket: "loop-bfc7c.appspot.com",
  messagingSenderId: "653225466379",
  appId: "1:653225466379:web:925058f07c076e1a6bc50e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey there, I'm using Loop",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatData: [],
    });
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const resetPass = async (email) =>{
  if(!email){
    toast.error("Enter your email")
    return null;
  }
  try {
    const userRef = collection(db,'users');
    const q = query(userRef, where("email","==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth,email);
      toast.success("Reset Email Sent")
    }else{
      toast.error("Email doesn't exist")
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message)
    
  }
}

export { signup, login, logout, auth, db, resetPass };
