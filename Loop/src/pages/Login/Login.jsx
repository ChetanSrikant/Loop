import React from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { useState } from 'react'
import { signup, login } from '../../config/firebase'

const Login = () => {

  const [currentState, setCurrentState] = useState("Sign Up");
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = (event) =>{
    event.preventDefault();
    if(currentState==='Sign Up'){
      signup(userName,email,password);
    }else{
      login(email, password);
    }
  }

  return (
    <div className='login'>
      <img className='logo' src={assets.logo_big} alt="" />
      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currentState}</h2>
        {currentState === 'Sign Up' ? <input onChange={(e)=>setUserName(e.target.value)} value={userName} type="text" placeholder='Username' className='form-input' required/>:null}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email address' className='form-input' required/>
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className='form-input' required/>
        <button type='Submit'>{currentState === "Sign Up" ? "Create Account": "Login now"}</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms and conditions of use & privacy policy</p>
        </div>

        <div className="login-forgot">
          {
            currentState === 'Sign Up'
            ? <p className="login-toggle">Already have an account <span onClick={()=> setCurrentState("Login")}>Login here</span></p>
            :<p className="login-toggle">Create an account <span onClick={()=> setCurrentState("Sign Up")}>click here</span></p>
          }
        </div>
        <form-input></form-input>
      </form>
    </div>
  )
}

export default Login
