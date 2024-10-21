import React, { useContext, useState } from "react";
import "./LeftSideBar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const { userData, chatData,chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const searchedUser = querySnap.docs[0].data();
          const userExists = chatData?.some((chat) => chat.rId === searchedUser.id);

          if (!userExists) {
            setUser(searchedUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(), // Fixed typo here
        messages: [],
      });

      const chatEntry = {
        messagesID: newMessageRef.id,
        lastMessage: "",
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: true,
      };

      await updateDoc(doc(chatsRef, user.id), {
        chatData: arrayUnion(chatEntry),
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatData: arrayUnion({ ...chatEntry, rId: user.id }),
      });
    } catch (error) {
      console.error("Error adding chat:", error); // Added error logging
    }
  };

  const setChat = async(item) => {
    setMessagesId(item.messageId)
    setChatUser(item) 
  }

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu Icon" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="Search Icon" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here..."
          />
        </div>

        <div className="ls-list">
          {showSearch && user ? (
            <div onClick={addChat} className="friends add-user">
              <img src={user.avatar} alt="User Avatar" />
              <p>{user.name}</p>
            </div>
          ) : (
            (chatData)
              .map((item, index) => (
                <div onClick={()=> setChat(item)} key={index} className="friends">
                  <img src={item.userData.avatar} alt="Profile" />
                  <div>
                    <p>{item.userData.name}</p>
                    <span>{item.lastMessage}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
