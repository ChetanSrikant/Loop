import React, { useContext , useEffect, useState} from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'

const ChatBox = () => {

  const {userData , messagesId, chatUser, messages, setMessages} = useContext(AppContext)

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        // Update messages collection with the new message
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
  
        const userIds = [chatUser.rId, userData.id];
  
        // Update each user's chat data
        for (const id of userIds) {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
  
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatsData = userChatData.chatData || [];
  
            const chatIndex = chatsData.findIndex(
              (c) => c.messagesID === messagesId
            );
  
            if (chatIndex !== -1) {
              chatsData[chatIndex].lastMessage = input.slice(0, 30);
              chatsData[chatIndex].updatedAt = Date.now();
              if (chatsData[chatIndex].rId === userData.id) {
                chatsData[chatIndex].messageSeen = false;
              }
  
              // Update Firestore with the modified chatsData array
              await updateDoc(userChatsRef, {
                chatData: chatsData,
              });
            } else {
              console.warn(`Chat with messageId ${messagesId} not found.`);
            }
          } else {
            console.warn(`No chat data found for user with ID ${id}.`);
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error sending message:", error);
    }
    setInput(""); // Clear input after sending the message
  };

  const sendImage = async(e) =>{
    try {
      
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });
  
        const userIds = [chatUser.rId, userData.id];
  
        // Update each user's chat data
        for (const id of userIds) {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
  
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatsData = userChatData.chatData || [];
  
            const chatIndex = chatsData.findIndex(
              (c) => c.messagesID === messagesId
            );
  
            if (chatIndex !== -1) {
              chatsData[chatIndex].lastMessage = "Image";
              chatsData[chatIndex].updatedAt = Date.now();
              if (chatsData[chatIndex].rId === userData.id) {
                chatsData[chatIndex].messageSeen = false;
              }
  
              // Update Firestore with the modified chatsData array
              await updateDoc(userChatsRef, {
                chatData: chatsData,
              });
            } else {
              console.warn(`Chat with messageId ${messagesId} not found.`);
            }
          } else {
            console.warn(`No chat data found for user with ID ${id}.`);
          }
        }
      

      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const convertTimestamp = (timeStamp) =>{
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour>12) {
      return hour-12 + ":" + minute + " PM"
    }else{
      return hour + ":" + minute + " AM"
    }
  }
  

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId),(res)=>{
        setMessages(res.data().messages.reverse());
      })
      return()=>{
        unSub()
      }
    }
  }, [messagesId])
  

  return chatUser ?(
    <div className='chat-box'>
      <div className="chat-user">
        <img src={chatUser.userData.avatar}/>
        <p>{chatUser.userData.name}{Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" /> : null}</p>
        <img src={assets.help_icon} className='help' />
      </div>

      <div className="chat-msg">

        {messages.map((msg,index)=>(
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"]
            ? <img className='msg-img' src={msg.image} alt="" />
            : <p className="msg">{msg.text}</p>
          }          
          <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
              <p>{convertTimestamp(msg.createdAt)}</p>
          </div>
      </div>
        ))}
      
      </div>

      <div className="chat-input">
        <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Send a message'/>
        <input onChange={sendImage} type="file" id='image' accept='image/png , image/jpeg' hidden/>
        <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} onClick={sendMessage} alt="" />
      </div>
    </div>
  ):
  <div className='chat-welcome'>
    <img src={assets.logo_icon} alt="" />
    <p>Chat anytime, anywhere</p>
  </div>
}

export default ChatBox
