import React, { useContext , useEffect, useState} from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'

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
            const chatsData = userChatData.chatsData || []; // Ensure chatsData exists
  
            const chatIndex = chatsData.findIndex((c) => c.messageId === messagesId);
  
            // If chat entry exists, update it
            if (chatIndex !== -1) {
              chatsData[chatIndex].lastMessage = input.slice(0, 30);
              chatsData[chatIndex].updatedAt = Date.now();
              if (chatsData[chatIndex].rId === userData.id) {
                chatsData[chatIndex].messageSeen = false;
              }
  
              // Update Firestore with the modified chatsData array
              await updateDoc(userChatsRef, {
                chatsData,
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
  
  

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId),(res)=>{
        setMessages(res.data().messages.reverse());
        console.log(res.data().messages.reverse());
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
        <p>{chatUser.userData.name}<img className='dot' src={assets.green_dot} alt="" /></p>
        <img src={assets.help_icon} className='help' />
      </div>

      <div className="chat-msg">
      <div className="s-msg">
            <p className="msg">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <div>
                <img src={assets.profile_img} alt="" />
                <p>2:30 PM</p>
            </div>
        </div>

        <div className="s-msg">
            <img src={assets.pic1} className='msg-img' alt="" />
            <div>
                <img src={assets.profile_img} alt="" />
                <p>2:30 PM</p>
            </div>
        </div>

        <div className="r-msg">
            <p className="msg">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <div>
                <img src={assets.profile_img} alt="" />
                <p>2:30 PM</p>
            </div>
        </div>
      </div>

      <div className="chat-input">
        <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Send a message'/>
        <input type="file" id='image' accept='image/png , image/jpeg' hidden/>
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
